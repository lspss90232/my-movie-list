(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12

  //使用axios抓取電影資料，將資料放進data陣列中，將陣列資料帶入displayDataList()印出資料到網頁
  axios.get(INDEX_URL)
    .then((response) => {
      //會有雙層陣列
      // data.push(response.data.results)
      // console.log(data)
      //用迴圈改善這個問題
      // for (let item of response.data.results) {
      //   data.push(item)
      // }
      // console.log(data)
      data.push(...response.data.results)
      //“...”:展開運算子--將陣列元素展開
      console.log(data)
      displayDataList(data)
      getTotalPages(data)
      getPageData(1, data)

    })
    .catch((err) => console.log(err))

  //綁定監聽器
  //1.按小格的電影清單中more和“＋”會執行事件
  dataPanel.addEventListener('click', (event) => {
    //使用event.target.matches判斷點擊到的物件是否有包含 .btn-show-movie 的className。
    if (event.target.matches('.btn-show-movie')) {
      //因於button中已建立dataset(data-格式)，因此可直接抓取其中的id
      showMovie(event.target.dataset.id)  //將單筆電影資料依指定格式印到浮動視窗中
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id) //將我的最愛電影顯現在Favorite頁面
    }
  })

  //2.點擊頁碼時，顯示當前頁數的12部電影資料
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page, data)
    }
  })


  //將data內容（所有電影資料）依htmlContent中指定的格式印出在網頁上
  function displayDataList(data) {
    let htmlContent = ''
    //item為陣列中的物件，index為物件中的索引值(ex:data =[{id:1,title:"Ready Player One",image:...},{id:2,title:...},{id:3,...}];其中item為{}中的物件;index為data中索引的順序(ex:第一個{}中的物件索引值為0)
    data.forEach(function (item, index) {
      //以下將指定的格式存入htmlContent，再將其存至dataPanel，丟至html，於網站上顯示
      htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h5 class="card-title">${item.title}</h5>
            </div>

            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }
  //將單筆電影資料依指定格式印到浮動視窗中
  function showMovie(id) {
    // get elements 抓取資料存於變數
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')
    // set request url 建立URL
    const url = INDEX_URL + id
    console.log(url)
    // send request to show api 對API發送需求
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)
      // insert data into modal ui 將抓取的資料存回HTML中的modal
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }
  //收藏功能---點擊“＋”後會被加到我的最愛清單（暫存瀏覽器中）
  function addFavoriteItem(id) {
    //local storage 裡的value是string type(純文字），存入 data 時需要呼叫轉換：
    //JSON.stringify(obj)＝>字串，而取出時需要呼叫JSON.parse(value)＝>數字。
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //抓取上次儲存在localStorage的資料，否則為空陣列
    //傳回id符合的那筆電影物件
    const movie = data.find(item => item.id === Number(id))
    console.log(movie)
    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    //licalStorage儲存字串，所以要先用JSON.stringify(list)=>字串後再放入
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  //搜尋功能---按“search”按鈕會發生的事件-篩出與input值部份相同或完全相同的電影title，並將所有電影資料印到網頁上
  searchForm.addEventListener('submit', event => {
    let results = []
    //防止頁面每按一次search按鈕就重新整理一次(預設表單送出會重新整理)
    event.preventDefault()
    //建立篩選規則：字串處理-正規運算值new RegExp(要篩選的值,‘i’代表忽略大小寫)
    const regex = new RegExp(searchInput.value, 'i')
    //篩選
    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    //將經過篩選的電影印到網頁上
    getTotalPages(results)
    getPageData(1, results)
  })
  //也可以使用以下來做篩選：
  // searchForm.addEventListener('submit', event => {
  //   event.preventDefault()
  //   let input = searchInput.value.toLowerCase()
  //   let results = data.filter(
  //     movie => movie.title.toLowerCase().includes(input)
  //   )
  //   console.log(results)
  //   displayDataList(results)
  // })


  //計算總頁數並演算 li.page-item
  function getTotalPages(data) {
    //跑出全部頁數--看data陣列長度除每頁要顯示的電影，為一共需要幾頁
    //Math.ceil-將小數無條件的進位
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  //切換分頁---點擊頁碼時，抓取特定頁面電影資料-將電影分區間（12部一組）
  function getPageData(pageNum, data) {
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = data.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

})()
