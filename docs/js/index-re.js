function clip(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function gaussianRandom(mean = 0, std = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * std + mean;
}

function random_color(r_mean, g_mean, b_mean, dropout_prob = 0) {
    let range = 20;
    let r = clip(gaussianRandom(r_mean, range), 0, 255);
    let g = clip(gaussianRandom(g_mean, range), 0, 255);
    let b = clip(gaussianRandom(b_mean, range), 0, 255);
    let dropout = Math.random();
    return `rgba(${r}, ${g}, ${b}, ${dropout >= dropout_prob ? 1 : 0})`;
}

function fill_tensor(tensor_container, pixel_height, gap, col_num, target_height) {
    let row_num = Math.floor((target_height + gap) / (pixel_height + gap));
    row_num = Math.max(row_num, 2);
    const pixel_num = row_num * col_num;

    const current_pixel_num = tensor_container.childElementCount;

    if (current_pixel_num < pixel_num) {
        for (let i = current_pixel_num; i < pixel_num; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'tensor-pixel';
            pixel.style.backgroundColor = random_color(84, 137, 140, 0);
            tensor_container.appendChild(pixel);
        }
    } else if (current_pixel_num > pixel_num) {
        for (let i = current_pixel_num; i > pixel_num; i--) {
            tensor_container.removeChild(tensor_container.lastChild);
        }
    }
}

window.onload = function () {
    init_home_top();
    fill_any_tensor();
    update_home_top_tensors();

    // resize event
    window.addEventListener('resize', function () {
        update_home_top_tensors();
    });
}

function update_home_top_tensors() {
    const home_article_tensor_html = document.getElementsByClassName("home-top-article-tensor")[0];
    let target_html = document.getElementsByClassName("home-top-article-container")[0];
    let target_height = target_html.offsetHeight;
    fill_tensor(home_article_tensor_html, 15, 3, 3, target_height);
}


class HomeTopController {
    topic_view_idx = {};
    cur_topic = "";
    constructor() {}
    set_cur_topic(topic) {
        this.cur_topic = topic;
        if (this.topic_view_idx[topic] === undefined) {
            this.topic_view_idx[topic] = 0;
        }
    }
    get_cur_topic() {
        if (this.cur_topic === "") {
            console.error("cur_topic is not set");
            return "";
        }
        return this.cur_topic;
    }
    moveto_next_idx(topic) {
        let ret = -1;
        if (home_top_info === undefined || (typeof home_top_info) !== "object" || Object.keys(home_top_info).length === 0) {
            console.error("home_top_info is not ready");
            return -1;
        }
        if (home_top_info[topic] === undefined) {
            console.error(`topic ${topic} not found`);
            return -1;
        }
        if (this.topic_view_idx[topic] === undefined) {
            this.topic_view_idx[topic] = 0;
        }
        ret = this.topic_view_idx[topic] + 1;
        if (ret >= home_top_info[topic].length) {
            ret = 0;
        }
        this.topic_view_idx[topic] = ret;
        return ret;
    }
    moveto_prev_idx(topic) {
        let ret = -1;
        if (home_top_info === undefined || (typeof home_top_info) !== "object" || Object.keys(home_top_info).length === 0) {
            console.error("home_top_info is not ready");
            return -1;
        }
        if (home_top_info[topic] === undefined) {
            console.error(`topic ${topic} not found`);
            return -1;
        }
        if (this.topic_view_idx[topic] === undefined) {
            this.topic_view_idx[topic] = 0;
        }
        ret = this.topic_view_idx[topic] - 1;
        if (ret < 0) {
            ret = home_top_info[topic].length - 1;
        }
        this.topic_view_idx[topic] = ret;
        return ret;
    }
    get_cur_idx(topic) {
        if (this.topic_view_idx[topic] === undefined) {
            this.topic_view_idx[topic] = 0;
        }
        return this.topic_view_idx[topic];
    }
}

const home_top_controller = new HomeTopController();


function extract_title_desc(obj) {
    if (obj === undefined) {
        console.error("obj is not defined");
        return ["", ""];
    }
    let title = obj.title;
    let desc = obj.description || obj.content;
    if (title === undefined) {
        console.error("title or desc not found");
        return ["", ""];
    }
    // if (desc === undefined) {
    //     desc = obj.content;
    //     if (desc === undefined) {
    //         desc = "";
    //     } else {
    //         desc = desc.replaceAll("\n", " ");
    //         desc = desc.replaceAll("\r", " ");
    //         desc = desc.replaceAll("\t", " ");
    //     }
    // }
    // // cut the content if it is too long
    // if (desc.length > 200) {
    //     desc = desc.substring(0, 200) + "...";
    // }
    return [title, desc];
}

function init_home_top() {
    const topic_html_list = document.getElementsByClassName("home-top-topic");
    for (let i = topic_html_list.length-1; i >= 0; i--) {
        const topic_html = topic_html_list[i];
        const topic_id = topic_html.getAttribute("topic_id");
        if (topic_id == undefined || topic_id === "") {
            continue;
        }
        home_top_controller.set_cur_topic(topic_id);
        
        topic_html.addEventListener('click', function() {
            let topic_id = this.getAttribute("topic_id");
            home_top_controller.set_cur_topic(topic_id);
            let [title, desc] = extract_title_desc(home_top_info[topic_id][0]);
            document.getElementsByClassName("home-top-article-title-cur")[0].innerText = title;
            document.getElementsByClassName("home-top-article-desc-cur")[0].innerText = desc;
            update_home_top_tensors();
            // update topic selected
            for (let i = 0; i < topic_html_list.length; i++) {
                console.log(i);
                let topic_html_tmp = topic_html_list[i];
                if (topic_html_tmp.getAttribute("topic_id") == topic_id) {
                    topic_html_tmp.classList.add("home-top-topic-selected");
                } else {
                    topic_html_tmp.classList.remove("home-top-topic-selected");
                }
            }
        });
    }

    const prev_button = document.getElementsByClassName("home-top-article-prev-button")[0];
    prev_button.addEventListener('click', function() {
        let topic_id = home_top_controller.get_cur_topic();
        let idx = home_top_controller.moveto_prev_idx(topic_id);
        if (idx < 0) {
            console.error("up click idx < 0");
            return;
        }
        let [title, desc] = extract_title_desc(home_top_info[topic_id][idx]);
        document.getElementsByClassName("home-top-article-title-cur")[0].innerText = title;
        document.getElementsByClassName("home-top-article-desc-cur")[0].innerText = desc;
        update_home_top_tensors();
    });


    const next_button = document.getElementsByClassName("home-top-article-next-button")[0];
    next_button.addEventListener('click', function() {
        let topic_id = home_top_controller.get_cur_topic();
        let idx = home_top_controller.moveto_next_idx(topic_id);
        if (idx < 0) {
            console.error("down click idx < 0");
            return;
        }
        let [title, desc] = extract_title_desc(home_top_info[topic_id][idx]);
        document.getElementsByClassName("home-top-article-title-cur")[0].innerText = title;
        document.getElementsByClassName("home-top-article-desc-cur")[0].innerText = desc;
        update_home_top_tensors();
    });
}


function fill_any_tensor() {
    const tensor_likes = document.getElementsByClassName('tensor-like');
    for (let tensor_like of tensor_likes) {
        const n_col = parseInt(tensor_like.getAttribute('tj'));
        const n_row = parseInt(tensor_like.getAttribute('ti'));
        for (let i = 0; i < n_row; i++) {
            for (let j = 0; j < n_col; j++) {
                const div = document.createElement('div');
                div.classList.add('tensor-like-pixel');
                let dropout_prob = 2 * Math.sqrt(((n_row - i) / n_row) * (j / n_col));
                let color = random_color(204, 99, 69, 0);
                div.style.backgroundColor = color;
                tensor_like.appendChild(div);
            }
        }
    }
}


window.addEventListener('load', function() {
    create_home_top_area_observer();
    observe_home_article_lists();
    home_top_click_init();
}, false);

function create_home_top_area_observer() {
    const article_list_area = document.getElementsByClassName("home-article-lists-area")[0];
    const home_top_area = document.getElementsByClassName("home-top-area")[0];
    const article_list_area_observer = new IntersectionObserver(function(entries, observer) {
        for (let entry of entries) {
            if (entry.isIntersecting) {
                article_list_area.style.opacity = 0;
                home_top_area.style.opacity = 1;
                // disable the article list area click event response
                article_list_area.style.pointerEvents = "none";
            } else {
                // article_list_area.style.opacity = Math.min(1, calc_percentage(entry.intersectionRatio, 0.8, 0.5));
                // home_top_area.style.opacity = Math.max(0, calc_percentage(entry.intersectionRatio, 0.5, 0.8));
                article_list_area.style.opacity = 1;
                home_top_area.style.opacity = 0;
                // enable the article list area click event response
                article_list_area.style.pointerEvents = "auto";
            }
        }
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.9//buildThresholdList(start_ratio=0.8, end_ratio=0.5, num_stap=50)
    });
    article_list_area_observer.observe(home_top_area);
}

function buildThresholdList(start_ratio, end_ratio, num_stap) {
    let thresholds = [];
    for (let i = 0; i <= num_stap; i++) {
        let ratio = start_ratio + (end_ratio - start_ratio) * i / num_stap;
        thresholds.push(ratio);
    }
    return thresholds;
}

function calc_percentage(n, start, end) { // -> [0, 1]
    let ret = (n - start) / (end - start);
    return clip(ret, 0, 1);
}

function observe_home_article_lists() {
    const home_article_lists = document.getElementsByClassName("article-list");
    const index_items = document.getElementsByClassName("article-list-index");
    if (home_article_lists.length < index_items.length) {
        console.error("home_article_lists.length != index_items.length");
        return;
    }

    const article_list_titles = document.getElementsByClassName("article-list-title");
    for (let i = 0; i < index_items.length; i++) {
        let index_item = index_items[i];
        let title_html = article_list_titles[i];
        if (title_html.id !== undefined && title_html.id !== "") {
            index_item.href = "#" + title_html.id;
        }
    }

    setTimeout(function() { // ensure the first list index is selected
        for (let i = 0; i < index_items.length; i++) {
            if (i == 0) {
                index_items[i].classList.add("article-list-index-selected");
            } else {
                index_items[i].classList.remove("article-list-index-selected");
            }
        }
    }, 100);

    for (let i = 0; i < home_article_lists.length; i++) {
        let home_article_list = home_article_lists[i];
        let target = home_article_list.querySelector(".article-entry-title");
        console.log(target);
        if (target === null) {
            console.error("fail to observe the first article's title");
            continue;
        }
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log("intersecting  ", target.textContent);
                    for (let j = 0; j < index_items.length; j++) {
                        if (j === i) {
                            index_items[j].classList.add("article-list-index-selected");
                        } else {
                            index_items[j].classList.remove("article-list-index-selected");
                        }
                    }
                } else {
                    console.log("going out  ", target.textContent);
                    // do nothing if the list is still in the viewport
                    let rect = target.getBoundingClientRect();
                    console.log(rect);
                    if (rect.bottom < 20) {
                        return;
                    }
                    for (let j = 0; j < index_items.length; j++) {
                        if (j === Math.max(0, i-1)) {
                            index_items[j].classList.add("article-list-index-selected");
                        } else {
                            index_items[j].classList.remove("article-list-index-selected");
                        }
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        });
        observer.observe(target);
    }
}

function home_top_click_init() {
    const home_top_article_container = document.getElementsByClassName("home-top-article-container")[0];
    home_top_article_container.addEventListener('click', function() {
        let current_topic_id = home_top_controller.get_cur_topic();
        let current_idx = home_top_controller.get_cur_idx(current_topic_id);
        let current_url = home_top_info[current_topic_id][current_idx].url;
        window.location.href = current_url;
    });
}
