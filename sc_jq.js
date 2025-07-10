const api = 'https://openlibrary.org'; //Menyimpan url api dalam variabel 

// Fungsi untuk memngambil data dari cache atau internet, kemudian menampilkan data kedalam html
function showGenre(genre, container) { 
  const apiUrl = `${api}/subjects/${genre}.json?limit=5`; //api sumber data disimpan dalam variabel 
  //data api diambil berdasarkan genre yang diminta dengan limit 5 data

  if (!navigator.onLine) { //mengecek jika sedang offline
    if ('caches' in window) { //mengecek jika terdapat cache 
      caches.match(apiUrl).then((response) => { //Mengambil data dari cache sesuai dengan url / request
        if (response) {
          response.json().then((data) => {
            let content = frameLayout(data.works); //jika ada respon data dari cache, maka dipanggil fungsi untuk membuat layout data
            container.insertAdjacentHTML('beforeend', content); // Menampilkan data pada html
          })
        }
      });
    }
  } else { //Jika sedang online
    //Mengambil data dari internet menggunakan ajax
    $.ajax({
      url: apiUrl,
      type: 'get',
      dataType: 'json',
      success: function(response) {
        if (response.works.length > 0) { //jika terdapat response data dan data pada response lebih dari 0
          let buku = response.works; //Menyimpan data pada variabel
  
          //Melakukan cache data pada cache bernama genre-cache-v1
          if ('caches' in window) {
            caches.open('genre-cache-v1').then((cache) => {
              cache.put(apiUrl, new Response(JSON.stringify(response)));
            });
          }
  
          // Perulangan untuk melakukan cache gambar yang dibutuhkan untuk ditampilkan
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
  
          let content = frameLayout(buku); // memanggil fungsi untuk membuat layout data
          container.insertAdjacentHTML('beforeend', content); // Memasukkan layout yang sudah dibuat kedalam html
        }
      }
    });
  }
}

//Fungsi untuk menampilkan data buku lebih banyak pada satu genre
function showFullGenre(genre, container, page){
  $('#genre').html('');
  //Mengambil data dari api melalui internet menggunakan ajax 
  $.ajax({
    url: `${api}/subjects/${genre}.json?limit=16&page=${page}`,
    type: 'get',
    dataType: 'json',
    success: function(response) {
      if (response.works.length > 0) {  //jika terdapat response data dan data pada response lebih dari 0
        let buku = response.works; //Menyimpan data pada variabel
        let content = '';

        $.each(buku, function(i, data) { //Perulangan untuk setiap data yang diterima
          //Mengecek jika terdapat data dengan nama authors dan terdapat nama pada salah satu data author
          let textContent = data.authors && data.authors[0]?.name
            ? data.authors[0].name
            : "Information not available";

          //Mengecek jika tersedia data dengan nama cover_id yang digunakan untuk mengambil gambar cover buku dengan menggunakan api, 
          // jika ada maka akan diambil gambar, jika tidak akan mengenerate placeholder
          let srcImg = data.cover_id
            ? `https://covers.openlibrary.org/b/id/${data.cover_id}-M.jpg`
            : `https://via.placeholder.com/150`;

            preloadImage(srcImg); //Memanggil fungsi preloadImage

          //Menambahkan layout untuk tiap data buku yang ada
          content += `
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

        container.insertAdjacentHTML('beforeend', content); // Memasukkan layout yang sudah dibuat kedalam html
      }
    }
  });
}

//Membuat fungsi untuk action pada tombol dengan id cari-bk,
//Ketika tombol diklik maka fungsi redirect_page() dipanggil
$(document).ready(function () { //Mengecek apakah file html telah selesai dirender browser
  $('#cari-bk').on('click', function () {
    redirect_pages();
  });

  //Membuat fungsi untuk action pada input dengan id cari-buku,
  //Ketika berada pada kolom input dan melakukan klik tombol enter 
  // maka fungsi redirect_page() dipanggil
  $('#cari-buku').on('keyup', function (event) {
    if (event.which === 13) {
      redirect_pages();
    }
  });
});

//Fungsi untuk memindahkan / berpindah halaman menjadi halaman search.html dengan parameter 
//Parameter adalah input pencarian yang dimasukan user
function redirect_pages(){
  const query = $("#cari-buku").val();

  window.location.href = `search.html?search=${query}`;
}

//Fungsi untuk menampilkan data buku berdasarkan judul (input pencarian user)
function search(squery, container){
  $('#genre').html('');
  //Mengambil data dari api melalui internet menggunakan ajax 
  $.ajax({
    url: `${api}/search.json?q=${squery}&limit=20`,
    type: 'get',
    dataType: 'json',
    success: function(response) {
      if (response.numFound > 0) { //jika terdapat response data dan data pada response lebih dari 0
        let buku = response.docs; //Menyimpan data pada variabel
        let content = '';

        $.each(buku, function(i, data) {//Perulangan untuk setiap data yang diterima
          //Mengecek jika terdapat data dengan nama author_author
          let textContent = data.author_name[0]
            ? data.author_name[0]
            : "Information not available";

          //Mengecek jika tersedia data dengan nama cover_id yang digunakan untuk mengambil gambar cover buku dengan menggunakan api, 
          // jika ada maka akan diambil gambar, jika tidak akan mengenerate placeholder
          let srcImg = data.cover_i
            ? `https://covers.openlibrary.org/b/id/${data.cover_i}-M.jpg`
            : `https://via.placeholder.com/150`;

          preloadImage(srcImg); //Memanggil fungsi preloadImage

          //Menambahkan layout untuk tiap data buku yang ada
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

        container.insertAdjacentHTML('beforeend', content); // Memasukkan layout yang sudah dibuat kedalam html
      }
    }
  });
}

//Fungsi untuk menambahkan tag link pada head html untuk melakukan preload
//Digunakan untuk meningkatkan performa
function preloadImage(url) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}

//Fungsi untuk membuat layout buku pada slide swiper
function frameLayout(buku){
  let content = '';
  $.each(buku, function(i, data) {
    //Perulangan untuk setiap data yang diterima
    //Mengecek jika terdapat data dengan nama authors dan terdapat nama pada salah satu data author
    let textContent = data.authors && data.authors[0]?.name
      ? data.authors[0].name
      : "Information not available";

    //Mengecek jika tersedia data dengan nama cover_id yang digunakan untuk mengambil gambar cover buku dengan menggunakan api, 
    // jika ada maka akan diambil gambar, jika tidak akan mengenerate placeholder
    let srcImg = data.cover_id
      ? `https://covers.openlibrary.org/b/id/${data.cover_id}-M.jpg`
      : `https://via.placeholder.com/150`;

      preloadImage(srcImg); //Memanggil fungsi preloadImage

    //Menambahkan layout untuk tiap data buku yang ada dengan slide swiper
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
  return content; //Mengembalikan layout html yang telah dibuat.
}