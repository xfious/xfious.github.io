window.onload = function() {
    let arclist_html = document.getElementById('arclist');
    for (let i = 0; i < postlist.length; i++) {
        let post_info = postlist[i];
        let post_entry_html = document.createElement('div');
        post_entry_html.className = 'post-entry';
        post_entry_html.innerHTML = `
            <a href="${post_info.path}">
                <div class="post-entry-">
                ${post_info.cover ? `<img src="${post_info.cover}" alt="cover">` : ''}
                <p>${post_info.title}</p>
                <p>${post_info.date}</p>
                <p>${post_info.path}</p>
                </div>
            </a>
        `;
        arclist_html.appendChild(post_entry_html);
    }
}