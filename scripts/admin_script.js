document.addEventListener('DOMContentLoaded', function() {
    const adminContent = document.getElementById('admin-content');
    let currentPage = 1;
    const itemsPerPage = 10;
    let searchQuery = '';

    function paginate(array, page, itemsPerPage) {
        return array.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    }

    function renderPagination(totalItems, currentPage, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let paginationHtml = '<nav aria-label="Page navigation"><ul class="pagination justify-content-center">';
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#">${i}</a></li>`;
        }
        paginationHtml += '</ul></nav>';
        return paginationHtml;
    }

    function filterData(data, query) {
        if (!query) return data;
        return data.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(query.toLowerCase())
            );
        });
    }

    function renderTable(contentType, data) {
        let html = '';
        if (contentType === 'felhasznalok') {
            const filteredUsers = filterData(data.users, searchQuery);
            const paginatedUsers = paginate(filteredUsers, currentPage, itemsPerPage);
            html += '<table class="table table-dark table-striped">';
            html += '<thead><tr><th>ID</th><th>Felhasználónév</th><th>Jelszó</th><th>Email</th><th>Rang</th><th>Létrehozva</th><th></th></tr></thead>';
            html += '<tbody>';
            paginatedUsers.forEach(user => {
                const roleOptions = `
                    <select data-id="${user.id}" data-field="role" class="form-select bg-dark text-light">
                        <option value="0" ${user.role == 0 ? 'selected' : ''}>Felhasználó</option>
                        <option value="1" ${user.role == 1 ? 'selected' : ''}>Admin</option>
                    </select>
                `;
                html += `<tr>
                    <td>${user.id}</td>
                    <td contenteditable="true" data-id="${user.id}" data-field="username">${user.username}</td>
                    <td contenteditable="true" data-id="${user.id}" data-field="password">${user.password}</td>
                    <td contenteditable="true" data-id="${user.id}" data-field="email">${user.email}</td>
                    <td>${roleOptions}</td>
                    <td>${user.created_at}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}" data-type="user" style="display: flex;">🗑️</button>
                        <div class="confirm-delete" style="display: none;">
                            <button class="btn btn-sm btn-success confirm-yes" data-id="${user.id}" data-type="user">Igen</button>
                            <button class="btn btn-sm btn-secondary confirm-no">Nem</button>
                        </div>
                        <span class="delete-feedback" style="display: none; margin-left: 10px;"></span>
                    </td>
                </tr>`;
            });
            html += '</tbody></table>';
            html += renderPagination(filteredUsers.length, currentPage, itemsPerPage);
            html += `<p>Összes felhasználó: ${data.total_users}</p>`;
            html += `<p>Összes admin: ${data.total_admins}</p>`;
        } else if (contentType === 'velemenyek') {
            const filteredComments = filterData(data.comments, searchQuery);
            const paginatedComments = paginate(filteredComments, currentPage, itemsPerPage);
            html += '<table class="table table-dark table-striped">';
            html += '<thead><tr><th>ID</th><th>Felhasználó ID</th><th>Film ID</th><th>Sorozat ID</th><th>Vélemény</th><th>Értékelés</th><th>Ajánlja?</th><th>Létrehozva</th><th></th></tr></thead>';
            html += '<tbody>';
            paginatedComments.forEach(comment => {
                html += `<tr>
                    <td>${comment.id}</td>
                    <td>${comment.user_id}</td>
                    <td>${comment.movie_id}</td>
                    <td>${comment.series_id}</td>
                    <td>${comment.comment}</td>
                    <td>${comment.rating}</td>
                    <td>${comment.recommended}</td>
                    <td>${comment.created_at}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${comment.id}" data-type="comment">🗑️</button>
                        <div class="confirm-delete" style="display: none;">
                            <button class="btn btn-sm btn-success confirm-yes" data-id="${comment.id}" data-type="comment">Igen</button>
                            <button class="btn btn-sm btn-secondary confirm-no">Nem</button>
                        </div>
                        <span class="delete-feedback" style="display: none; margin-left: 10px;"></span>
                    </td>
                </tr>`;
            });
            html += '</tbody></table>';
            html += renderPagination(filteredComments.length, currentPage, itemsPerPage);
            html += `<p>Összes vélemény: ${data.total_comments}</p>`;
        }
        return html;
    }

    function updateTable(contentType, data) {
        const tableHtml = renderTable(contentType, data);
        document.getElementById('table-container').innerHTML = tableHtml;

        document.querySelectorAll('[contenteditable="true"]').forEach(cell => {
            cell.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.blur();

                    const id = this.dataset.id;
                    const field = this.dataset.field;
                    const value = this.textContent.trim();

                    const user = data.users.find(user => user.id == id);
                    user[field] = value;

                    fetch('../backend/admin_felhasznalok.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(user)
                    })
                    .then(response => response.json())
                    .then(data => {
                        const feedback = document.createElement('span');
                        feedback.style.marginLeft = '10px';
                        feedback.style.verticalAlign = 'middle';
                        feedback.style.display = 'inline-block';
                        if (data.status === 'success') {
                            feedback.innerHTML = '✔️';
                            if (field === 'password') {
                                this.textContent = data.hashed_password;
                            }
                        } else {
                            feedback.innerHTML = '❌';
                            console.error(data.message);
                        }
                        this.parentNode.appendChild(feedback);
                        setTimeout(() => feedback.remove(), 5000);
                    })
                    .catch(error => {
                        const feedback = document.createElement('span');
                        feedback.style.marginLeft = '10px';
                        feedback.style.verticalAlign = 'middle';
                        feedback.style.display = 'inline-block';
                        feedback.innerHTML = '❌';
                        this.parentNode.appendChild(feedback);
                        setTimeout(() => feedback.remove(), 5000);
                        console.error('Error updating user data:', error);
                    });
                }
            });
        });

        document.querySelectorAll('select[data-field="role"]').forEach(select => {
            select.addEventListener('change', function() {
                const id = this.dataset.id;
                const field = this.dataset.field;
                const value = this.value;

                const user = data.users.find(user => user.id == id);
                user[field] = value;

                fetch('../backend/admin_felhasznalok.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(user)
                })
                .then(response => response.json())
                .then(data => {
                    const feedback = document.createElement('span');
                    feedback.style.marginLeft = '10px';
                    feedback.style.verticalAlign = 'middle';
                    feedback.style.display = 'inline-block';
                    if (data.status === 'success') {
                        feedback.innerHTML = '✔️';
                    } else {
                        feedback.innerHTML = '❌';
                        console.error(data.message);
                    }
                    this.parentNode.appendChild(feedback);
                    setTimeout(() => feedback.remove(), 5000);
                })
                .catch(error => {
                    const feedback = document.createElement('span');
                    feedback.style.marginLeft = '10px';
                    feedback.style.verticalAlign = 'middle';
                    feedback.style.display = 'inline-block';
                    feedback.innerHTML = '❌';
                    this.parentNode.appendChild(feedback);
                    setTimeout(() => feedback.remove(), 5000);
                    console.error('Error updating user data:', error);
                });
            });
        });

        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                currentPage = parseInt(this.textContent);
                updateTable(contentType, data);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const type = this.dataset.type;
                const confirmDeleteDiv = this.nextElementSibling;
                confirmDeleteDiv.style.display = 'flex';
            });
        });

        document.querySelectorAll('.confirm-yes').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const type = this.dataset.type;
                const confirmDeleteDiv = this.parentElement;
                const feedbackSpan = confirmDeleteDiv.nextElementSibling;

                fetch(`../backend/admin_torles.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: id, type: type })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        feedbackSpan.innerHTML = '✔️';
                        feedbackSpan.style.display = 'inline-block';
                        setTimeout(() => feedbackSpan.style.display = 'none', 5000);
                        loadContent(contentType);
                    } else {
                        feedbackSpan.innerHTML = '❌';
                        feedbackSpan.style.display = 'inline-block';
                        setTimeout(() => feedbackSpan.style.display = 'none', 5000);
                        console.error(data.message);
                    }
                })
                .catch(error => {
                    feedbackSpan.innerHTML = '❌';
                    feedbackSpan.style.display = 'inline-block';
                    setTimeout(() => feedbackSpan.style.display = 'none', 5000);
                    console.error('Error deleting item:', error);
                });
            });
        });

        document.querySelectorAll('.confirm-no').forEach(button => {
            button.addEventListener('click', function() {
                const confirmDeleteDiv = this.parentElement;
                confirmDeleteDiv.style.display = 'none';
            });
        });
    }

    function loadContent(contentType) {
        fetch(`../backend/admin_${contentType}.php`)
            .then(response => response.json())
            .then(data => {
                let html = '';
                if (contentType === 'felhasznalok') {
                    html += '<h2>Felhasználók</h2>';
                    html += '<input type="text" id="searchUsers" placeholder="Keresés..." class="form-control mb-3" value="' + searchQuery + '">';
                } else if (contentType === 'velemenyek') {
                    html += '<h2>Vélemények</h2>';
                    html += '<input type="text" id="searchComments" placeholder="Keresés..." class="form-control mb-3" value="' + searchQuery + '">';
                } else if (contentType === 'statisztikak') {
                    html += '<h2>Statisztikák</h2>';
                    html += `<p>Összes felhasználó: ${data.total_users}</p>`;
                    html += `<p>Összes admin: ${data.total_admins}</p>`;
                    html += `<p>Összes vélemény: ${data.total_comments}</p>`;
                }
                html += '<div id="table-container">';
                html += renderTable(contentType, data);
                html += '</div>';
                adminContent.innerHTML = html;

                if (contentType === 'felhasznalok') {
                    document.getElementById('searchUsers').addEventListener('input', function(event) {
                        searchQuery = event.target.value;
                        currentPage = 1;
                        updateTable(contentType, data);
                    });
                } else if (contentType === 'velemenyek') {
                    document.getElementById('searchComments').addEventListener('input', function(event) {
                        searchQuery = event.target.value;
                        currentPage = 1;
                        updateTable(contentType, data);
                    });
                }

                updateTable(contentType, data);
            })
            .catch(error => console.error('Error loading admin content:', error));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const contentType = urlParams.keys().next().value;

    if (contentType) {
        loadContent(contentType);
    }
});