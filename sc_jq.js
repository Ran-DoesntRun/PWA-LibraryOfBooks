const api = 'https://openlibrary.org';

function showGenre(genre, container) {

  const apiUrl = `${api}/subjects/${genre}.json?limit=5`;
  let content = '';


  if (!navigator.onLine) {
    if ('caches' in window) {
      caches.match(apiUrl).then((response) => {
        if (response) {
          response.json().then((data) => {
            let content = frameLayout(data.works); // build content
            container.insertAdjacentHTML('beforeend', content); // render
          }).catch(() => {
            $('#buku').html('<p class="text-danger">Cache data is invalid.</p>');
          });
        } else {
          $('#buku').html('<p class="text-danger">Tidak Bisa Ditampilkan Saat Offline</p>');
        }
      });
    }
  } else {
    $.ajax({
      url: apiUrl,
      type: 'get',
      dataType: 'json',
      success: function(response) {
        if (response.works.length > 0) {
          let buku = response.works;
  
          // Cache API response
          if ('caches' in window) {
            caches.open('genre-cache-v1').then((cache) => {
              cache.put(apiUrl, new Response(JSON.stringify(response)));
            });
          }
  
          // Cache each image
          $.each(buku, function (i, data) {
            let srcImg = data.cover_id
              ? `https://covers.openlibrary.org/b/id/${data.cover_id}-M.jpg`
              : `https://via.placeholder.com/150`;
  
            caches.open('genre-cache-v1').then((cache) => {
              fetch(srcImg).then((imgResponse) => {
                if (imgResponse.ok) {
                  cache.put(srcImg, imgResponse.clone());
                }
              });
            });
          });
  
          let content = frameLayout(buku); // build content
          container.insertAdjacentHTML('beforeend', content); // render
        }
      }
    });
  }
}

function showFullGenre(genre, container, page){
  $('#genre').html('');
  console.log('showfull')
  $.ajax({
    url: `${api}/subjects/${genre}.json?limit=16&page=${page}`,
    type: 'get',
    dataType: 'json',
    success: function(response) {
      if (response.works.length > 0) {
        let buku = response.works;
        let content = '';

        $.each(buku, function(i, data) {
          let textContent = data.authors && data.authors[0]?.name
            ? data.authors[0].name
            : "Information not available";

          let srcImg = data.cover_id
            ? `https://covers.openlibrary.org/b/id/${data.cover_id}-M.jpg`
            : `https://via.placeholder.com/150`;

            preloadImage(srcImg);

          content += `
            <!-- Card -->
            <div class="bg-gray-300 rounded-md p-2 h-full">
              <div class="grid grid-rows-[auto_1fr_auto] gap-3 h-full">
                <!-- Image -->
                <img src="${srcImg}" alt="${data.title}" class="w-full h-40 object-cover rounded-md" />
                
                <!-- Text -->
                <div>
                  <h3 class="font-semibold line-clamp-2">${data.title}</h3>
                  <p class="text-sm">Author: ${textContent}</p>
                  <p class="text-sm">Publish: ${data.first_publish_year}</p>
                </div>
                
                <!-- Button -->
                <a href="https://openlibrary.org${data.key}"
                  class="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded px-2 py-1 text-sm text-center block">
                  See More
                </a>
              </div>
            </div>
          `;
        });

        container.insertAdjacentHTML('beforeend', content);
      }
    }
  });
}

$(document).ready(function () {
  $('#cari-bk').on('click', function () {
    console.log('143');
    redirect_pages();
  });

  $('#cari-buku').on('keyup', function (event) {
    if (event.which === 13) {
      console.log('13');
      redirect_pages();
    }
  });
});


function redirect_pages(){
  console.log('1342');
  const query = $("#cari-buku").val();

  window.location.href = `search.html?search=${query}`;
}

function search(squery, container){
  $('#genre').html('');
  console.log('showfull')
  console.log(`${api}/search.json?q=${squery}&limit=10`)
  $.ajax({
    url: `${api}/search.json?q=${squery}&limit=20`,
    type: 'get',
    dataType: 'json',
    success: function(response) {
      if (response.numFound > 0) {
        let buku = response.docs;
        let content = '';

        $.each(buku, function(i, data) {
          let textContent = data.author_name[0]
            ? data.author_name[0]
            : "Information not available";

          let srcImg = data.cover_i
            ? `https://covers.openlibrary.org/b/id/${data.cover_i}-M.jpg`
            : `https://via.placeholder.com/150`;
            preloadImage(srcImg);
          content += `
            <!-- Card -->
            <div class="bg-gray-300 rounded-md p-2 h-full">
              <div class="grid grid-rows-[auto_1fr_auto] gap-3 h-full">
                <!-- Image -->
                <img src="${srcImg}" alt="${data.title}" fetchpriority="high" class="w-full h-40 object-cover rounded-md" />
                
                <!-- Text -->
                <div>
                  <h3 class="font-semibold line-clamp-2">${data.title}</h3>
                  <p class="text-sm">Author: ${textContent}</p>
                  <p class="text-sm">Publish: ${data.first_publish_year}</p>
                </div>
                
                <!-- Button -->
                <a href="https://openlibrary.org${data.key}"
                  class="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded px-2 py-1 text-sm text-center block">
                  See More
                </a>
              </div>
            </div>
          `;
        });

        container.insertAdjacentHTML('beforeend', content);
      }
    }
  });
}

function preloadImage(url) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}

function frameLayout(buku){
  let content = '';
  $.each(buku, function(i, data) {
    let textContent = data.authors && data.authors[0]?.name
      ? data.authors[0].name
      : "Information not available";

    let srcImg = data.cover_id
      ? `https://covers.openlibrary.org/b/id/${data.cover_id}-M.jpg`
      : `https://via.placeholder.com/150`;

      preloadImage(srcImg);

    content += `
    <div class="swiper-slide h-full">
      <div class="flex flex-col justify-between bg-gray-300 rounded-md p-2 h-full">
        <div class="flex space-x-3 flex-1">
          <img src="${srcImg}" alt="${data.title}"
              class="w-16 h-20 object-cover rounded-md self-start" />
          <div class="flex flex-col justify-between w-full">
            <div class="flex-1">
              <h3 class="font-semibold line-clamp-2">${data.title}</h3>
              <p class="text-sm">Author: ${textContent}</p>
              <p class="text-sm">Publish: ${data.first_publish_year}</p>
            </div>
          </div>
        </div>
        <a href="https://openlibrary.org${data.key}"
          class="bg-gradient-to-r w-full from-gray-400 to-gray-500 text-white rounded px-2 py-1 text-sm mt-2 text-center block">
          See More
        </a>
      </div>
    </div>


    `;
  });
  return content;
}