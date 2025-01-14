function showdatas() {
    $('#buku').html('<p>Loading...</p>');
    $('#carouselStarter').remove();

    const query = $("#cari-buku").val();

    console.log("Searching for:", query); 

    const apiUrl = `https://openlibrary.org/search.json?title=${query}&limit=10`;

    if (!navigator.onLine) {
        if ('caches' in window) {
            caches.match(apiUrl).then((response) => {
                if (response) {
                    response.json().then((data) => {
                        renderBooks(data.docs);  
                    }).catch(() => {
                        $('#buku').html('<p class="text-danger">Cache data is invalid.</p>');
                    });
                } else {
                    $('#buku').html('<p class="text-danger">Tidak Bisa Ditampilkan Saat Offline</p>');
                }
            });
        }
        return;
    }

    $.ajax({
        url: apiUrl,
        type: 'get',
        dataType: 'json',
        success: function (response) {
            if (response.numFound > 0) {
                renderBooks(response.docs);

                if ('caches' in window) {
                    caches.open('lob-cache-v1').then((cache) => {
                        cache.put(apiUrl, new Response(JSON.stringify(response)));
                    });
                }
            }
        },
    });
}

function renderBooks(books) {
    $('#buku').html('');
    $.each(books, function (i, data) {
        let textContent = data.author_name && data.author_name[0]
            ? `Author: ${data.author_name[0]}`
            : "Information not available";

        let srcImg = data.cover_i
            ? `https://covers.openlibrary.org/b/id/${data.cover_i}-M.jpg`
            : 'https://via.placeholder.com/150'; 

        $('#buku').append(`
            <div class="col">
                <div class="card h-100">
                    <img src="${srcImg}" class="card-img-top" alt="Cover not available" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${data.title}</h5>
                        <p class="card-text">${textContent}</p>
                    </div>
                    <div class="card-footer">
                        <a href="#" class="btn btn-primary detail" data-bs-toggle="modal" data-bs-target="#exampleModal" data-key="${data.key}">Selengkapnya</a>
                    </div>
                </div>
            </div>
        `);
    });
}

$('#cari-bk').on('click', function () {
    showdatas();
});

$('#cari-buku').on('keyup', function (event) {
    if (event.which === 13) {
        showdatas();
    }
});

$('#buku').on('click', '.detail', function () {
    const bookKey = $(this).data('key');
    modalFunc(bookKey);
});

function modalFunc(bookKey) {
    $.getJSON(`https://openlibrary.org${bookKey}.json`, function (result) {
        const coverImage = result.covers ? `https://covers.openlibrary.org/b/id/${result.covers[0]}-L.jpg` : 'https://via.placeholder.com/150';
        const title = result.title || "No Title Available";
        const description = result.description ? result.description.value : "No description available.";
        const authors = result.authors ? result.authors.map(author => author.name).join(", ") : "Unknown Author";
        const createdDate = result.created ? new Date(result.created.value).toLocaleDateString() : "N/A";
        const lastModified = result.last_modified ? new Date(result.last_modified.value).toLocaleDateString() : "N/A";

        $('#exampleModal .modal-body').html(`
            <div style="text-align: center;">
                <img src="${coverImage}" class="img-fluid" alt="Cover image" style="max-width: 100%; height: auto; margin-bottom: 15px;">
                <h5 style="font-weight: bold;">${title}</h5>
                <p class="text-wrap">${description}</p>
                <p><strong>Author:</strong> ${authors}</p>
                <p><strong>Created:</strong> ${createdDate}</p>
                <p><strong>Last Modified:</strong> ${lastModified}</p>
            </div>
        `);
    });
}

jQuery(function () {
    const subject = {
        "Romansa": "romance",
        "Fiksi": "fiction",
        "Coding": "programming",
        "Finansial": "finance",
        "Komedi": "humor"
    };

    const container = $('#buku');
    container.html('');

    $.each(subject, function (key, value) {
        container.append(`<h3 class="mt-4">${key}</h3>`);
        container.append('<div class="row row-cols-1 row-cols-md-3 g-4 genre-books"></div>');

        const currentGenreContainer = container.find('.genre-books').last();

        $.ajax({
            url: `https://openlibrary.org/subjects/${value}.json`,
            type: 'get',
            dataType: 'json',
            data: {
                "limit": "3"
            },
            success: function (response) {
                if (response.works && response.works.length > 0) {
                    let buku = response.works;

                    $.each(buku, function (i, data) {
                        console.log(data);
                        let textContent = data.authors && data.authors[0]?.name
                            ? data.authors[0].name
                            : "Information not available";

                        let srcImg = data.cover_id
                            ? `https://covers.openlibrary.org/b/id/${data.cover_id}-M.jpg`
                            : `https://via.placeholder.com/150`;

                        currentGenreContainer.append(`
                            <div class="col">
                                <div class="card h-100">
                                    <img src="${srcImg}" class="card-img-top" alt="Cover not available" style="height: 200px; object-fit: cover;">
                                    <div class="card-body">
                                        <h5 class="card-title">${data.title}</h5>
                                        <p class="card-text">${textContent}</p>
                                    </div>
                                    <div class="card-footer">
                                        <a href="#" class="btn btn-primary detail" data-bs-toggle="modal" data-bs-target="#exampleModal" data-key="${data.key}">Selengkapnya</a>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                } else {
                    currentGenreContainer.html('<p class="text-muted">Tidak ada buku tersedia untuk genre ini.</p>');
                }
            },
            error: function () {
                currentGenreContainer.html('<p class="text-danger">Gagal memuat buku untuk genre ini.</p>');
            }
        });
    });
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("sw.js")
        .then(serviceWorker => {
            console.log("Service Worker registered: ", serviceWorker);
        })
        .catch(error => {
            console.error("Error registering the Service Worker: ", error);
        });
}
