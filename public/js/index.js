console.log('File index.js is load');

$(document).ready(function(){
  var form = document.querySelector('#upload-form'),
      filesInput = form.querySelector('#images'),
      actionUpload = document.querySelector('#action-upload'),
      maxFileSize = 2 * 1024 * 1024; // (байт) Максимальный размер файла (2мб)
      files = [],
      imagesArray = {},
      image = {},
      uploadRuning = false;

      //пользователь пытается загрузить картинки на сервер
      $(actionUpload).on('click', function(){ uploadImages(); });
      //пользователь добавляет изображения в очередь загрузки
      $(filesInput).on('change', function(){ readImages(); });




      function uploadImage(image, i) {
        //Создаем объек FormData
        var data = new FormData();
        //Добавлем туда файл
        data.append('uploadFile', image.formFile);

        //отсылаем с попощью Ajax
        $.ajax({
            url: 'http://127.0.0.1:8000/img',
            data: data, cache: false,
            contentType: false, processData: false,
            contentType: 'multipart/form-data; boundary=------WebKitFormBoundaryD3KHhU1Bfd6hx1Ju',
            headers: {
              'Content-Type': 'multipart/form-data; boundary=------WebKitFormBoundaryD3KHhU1Bfd6hx1Ju',
              'boundary': '------WebKitFormBoundaryD3KHhU1Bfd6hx1Ju',
            },
            type: 'POST',
            success: function(response) {
              console.log(response);
              uploadRuning = false;
            },
            error: function(response) {
              console.log(response);
              uploadRuning = false;
            },
            xhr: function() { //шарим в запросе
              var myXhr = $.ajaxSettings.xhr(); //вытаскиваем экземпляр запроса
              if(myXhr.upload){ //если процесс загрузки идет
                //добавляет слушатель процесса загрузки и коллбек функцию
                myXhr.upload.addEventListener('progress', function (e) {
                  if(e.lengthComputable){ //если процесс идёт
                    //считаем сколько процентов звгрузилось
                    var max = e.total, current = e.loaded,
                        Percentage = (current * 100)/max;
                    imagesArray[i].compressionRatio = Percentage;
                    console.log(imagesArray[i].compressionRatio);
                  }
                });
              }
              return myXhr;
            },
        });

      }

      function uploadImages() {
        console.log('start upload images');
        if(!uploadRuning){
          uploadRuning = true;
          $.each(imagesArray, function(i, image) {
            uploadImage(image, i);
          });
        }
      }

      function readImages() {
        files = filesInput.files;
        $.each(files, function(i, image) {
            if (image.type != 'image/jpeg' && image.type != 'image/jpg' ) {
              alert( 'Фотография должна быть в формате jpg или jpeg' );
            }
            if ( image.size > maxFileSize ) {
              alert( 'Размер фотографии не должен превышать 2 Мб' );
            }
            var fileReader = new FileReader();
            // Инициируем функцию FileReader
            fileReader.onload = (function(file) {
               return function(e) {
                  //формируем объект изображения
                  //со всеми нужными данными
                  var loadedImage = {
                    i: i,
                    id: 'image-' + i,
                    name: file.name,
                    value: this.result,
                    size: file.size,
                    sizeAfter: file.size,
                    compressionRatio: 0,
                    complete: false,
                    ready: false,
                    formFile: file
                  };
                  //закидываем картинку в массив
                  imagesArray[i] = loadedImage;
                  //и добавляем на страницу
                  addImage(loadedImage);
               };
            })(image);
            //Читаем картинку при помощи функции выше
            fileReader.readAsDataURL(image);
          });
      }

      function addImage(image) {
        var imageContainer = document.querySelector('#image-container'),
            img = '';
        img = '<div id="' + image.id + '" class="image" data-iter="' + image.i + '" data-name="' + image.name + '" ';
        img += 'data-size="' + image.size + '" data-size-after="' + image.sizeAfter + '" />';
        img += '<img src="' + image.value + '">';
        img += '</div>';
        $(imageContainer).append(img);
      }

});
