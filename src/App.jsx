import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import './App.scss';

function App() {

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const apiPath = import.meta.env.VITE_API_PATH;
  
  const [products, setProducts] = useState([]);


  const getProduct = async () => {
    try {
      const res = await axios.get(`${baseUrl}/v2/api/${apiPath}/admin/products`);
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
    }
  }

  const userNameRef = useRef(null);
  const passWordRef = useRef(null);

  const [isAuth, setIsAuth] = useState(false);

  async function checkLogin () {
    try {
      await axios.post(`${baseUrl}/v2/api/user/check`);
      getProduct();
      setIsAuth(true);
    } catch (err) {
      console.log(err);
    }
  }

  const signin = async () => {
    try {
      const res = await axios.post(`${baseUrl}/v2/admin/signin`, {
        username: 'dog@gmail.com',
        password: '999888'
      });
      const { token, expired } = res.data;
      document.cookie = `dogfood=${token}; expires=${new Date(expired)}`;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() =>{
    signin();
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)dogfood\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    axios.defaults.headers.common['Authorization'] = token;
    checkLogin();
  }, [])


  const imageUrlRef = useRef(null);
  const imagesUrlRef = useRef(null);
  const titleRef = useRef(null);
  const categoryRef = useRef(null);
  const unitRef = useRef(null);
  const originPriceRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);
  const enableRef = useRef(null);
    


  const defaultValue = {
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imagesUrl: []
  };



  const [inputValue, setInputValue] = useState(defaultValue);


  
  const [action, setAction] = useState('');
  const [inputKey, setInputKey] = useState(1);
  const freshKey = 2;
  
  function handleInput (mode, product) {
    setAction(mode);


    switch (mode) {
      case 'create':
        setInputValue(defaultValue);
        break;

      case 'edit':
        setInputValue({
          ...product,
          imageUrl: product.imageUrl,
          title: product.title,
          category: product.category,
          unit: product.unit,
          origin_price: product.origin_price,
          price: product.price,
          description: product.description,
          content: product.content,
          is_enabled: product.is_enabled,
          imagesUrl: product.imagesUrl
        });

        break;

      case 'del':
        setInputValue(product);

        break;
    
      default:
        break;
    }
  }

  function refValue (ref) {
    
    const { name, value, type, checked } = ref.current;
    
    setInputValue({
      ...inputValue,
      [name]: type === 'checkbox' ? checked 
                                  : value
    })

    ref.current.value = '';

    ShowImg();
  }

  

  function imgesValue (ref) {
    const { value } = ref.current;

    setInputValue({
      ...inputValue,
      imagesUrl: [value, ...inputValue.imagesUrl]
    })

    ref.current.value = '';

    ShowImges();
  }


  function ShowImg () {
    return inputValue.imageUrl ? <img className="img-fluid" src={inputValue.imageUrl} alt={inputValue.title} /> : ''
  }

  function ShowImges () {
    return inputValue.imagesUrl.map((pic, index) => 
                                                <div className='col' key={index}>
                                                  <p className='mb-2'>副圖{index + 1}</p>
                                                  <img className="img-fluid mb-2" src={pic} alt='#' />

                                                  <button className="btn btn-outline-danger btn-sm w-100" onClick={() => {setInputValue({...inputValue,
                                                                                                                                         imagesUrl: [...inputValue.imagesUrl.filter(img => img !== inputValue.imagesUrl[index])]})
                                                                                                                          ShowImges()}}>刪除圖片</button>
                                                </div>)
  }


  async function createProduct () {
    try {
      await axios.post(`${baseUrl}/v2/api/${apiPath}/admin/product`, {
        data: {
          ...inputValue,
          origin_price: Number(inputValue.origin_price),
          price: Number(inputValue.price),
          is_enabled: inputValue.is_enabled ? 1 : 0
        }});
    } catch (err) {
      console.log(err);
    }
  }


  async function editProduct () {
    try {
      await axios.put(`${baseUrl}/v2/api/${apiPath}/admin/product/${inputValue.id}`, {
        data: {
          ...inputValue,
          origin_price: Number(inputValue.origin_price),
          price: Number(inputValue.price),
          is_enabled: inputValue.is_enabled ? 1 : 0
        }});
    } catch (err) {
      console.log(err);
    }
  }



  async function deleteProduct () {
    try {
      await axios.delete(`${baseUrl}/v2/api/${apiPath}/admin/product/${inputValue.id}`, {
        data: {
          ...inputValue,
          origin_price: Number(inputValue.origin_price),
          price: Number(inputValue.price),
          is_enabled: inputValue.is_enabled ? 1 : 0
        }});
    } catch (err) {
      console.log(err);
    }
  }





  async function handleUpdateProduct (play) {
    let move ;

    switch (play) {
      case 'create':
        move = createProduct;

        setInputValue(({
          imageUrl: imageUrlRef.current.value,
          title: titleRef.current.value,
          category: categoryRef.current.value,
          unit: unitRef.current.value,
          origin_price: originPriceRef.current.value,
          price: priceRef.current.value,
          description: descriptionRef.current.value,
          content: contentRef.current.value,
          is_enabled: enableRef.current.checked,
          imagesUrl: [...inputValue.imagesUrl]
        }));

        await move();

        getProduct();

        break;


      case 'edit':
        move = editProduct;

        await move();

        getProduct();

        break;


      case 'del':
        move = deleteProduct;

        await move();

        getProduct();

        break;
    
      default:
        break;
    }
    // await move();

    // getProduct();
  }


  



  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mt-4">
            <h2 className='m-0 fw-bold'>產品列表</h2>
            <button className="btn btn-primary" onClick={() => handleInput('create')} data-bs-toggle="modal" data-bs-target="#productModal">建立新的產品</button>
          </div>
          <table className="table mt-4">
            <thead>
              <tr>
                <th width="120">分類</th>
                <th width="120">產品名稱</th>
                <th width="120">原價</th>
                <th width="120">售價</th>
                <th width="100">是否啟用</th>
                <th width="120">編輯</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.title}</td>
                    <td>{item.origin_price}</td>
                    <td>{item.price}</td>
                    <td>{item.is_enabled ? <span className="text-success">啟用</span> : <span>未啟用</span>}</td>
                    <td>
                      <div className="btn-group">
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleInput('edit',item)} data-bs-toggle="modal" data-bs-target="#productModal">
                          編輯
                        </button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleInput('del',item)} data-bs-toggle="modal" data-bs-target="#delProductModal">
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">尚無產品資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin">  
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    // value={formData.username}
                    // onChange={handleInputChange}
                    ref={userNameRef}
                    required
                    autoFocus
                    />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    // value={formData.password}
                    // onChange={handleInputChange}
                    ref={passWordRef}
                    required
                    />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                  >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}

      <div
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        data-bs-backdrop="static"
        >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header bg-secondary text-white">
              <h5 id="productModalLabel" className="modal-title">
                {action === 'create' ? <span>新增產品</span> : <span>編輯產品</span>}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入主圖片網址
                      </label>
                      <input
                        ref={imageUrlRef}
                        name='imageUrl'
                        defaultValue={inputValue.imageUrl}
                        key={inputKey}
                        type="text"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        />
                    </div>
                    <p>主圖</p>
                    <ShowImg />
                  </div>

                  <div className='d-flex'>
                    {inputValue.imageUrl ? null : <button className="btn btn-outline-primary btn-sm w-100 me-1" onClick={() => refValue(imageUrlRef)}>新增圖片</button>}
                  
                    {inputValue.imageUrl ? <button className="btn btn-outline-danger btn-sm w-100" onClick={() => {setInputValue({...inputValue,imageUrl : null})}}>刪除圖片</button> : null}
                  </div>

                  <hr />

                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入副圖片網址
                      </label>
                      <input
                        ref={imagesUrlRef}
                        name='imagesUrl'
                        key={inputKey}
                        type="text"
                        className="form-control mb-3"
                        placeholder="請輸入圖片連結"
                        />

                      {inputValue.imagesUrl.length < 5 && <button className="btn btn-outline-primary btn-sm w-100 me-1" onClick={() => imgesValue(imagesUrlRef)}>新增圖片</button>}
                    </div>

                    <div className='row row-cols-1 gap-2'>
                      <ShowImges />
                    </div>
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">標題</label>
                    <input
                      ref={titleRef}
                      name='title'
                      value={inputValue.title}
                      onChange={() => refValue(titleRef)}
                      key={inputKey}
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">分類</label>
                      <input
                        ref={categoryRef}
                        name='category'
                        value={inputValue.category}
                        onChange={() => refValue(categoryRef)}
                        key={inputKey}
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">單位</label>
                      <input
                        ref={unitRef}
                        name='unit'
                        value={inputValue.unit}
                        onChange={() => refValue(unitRef)}
                        key={inputKey}
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">原價</label>
                      <input
                        ref={originPriceRef}
                        name='origin_price'
                        value={inputValue.origin_price}
                        onChange={() => refValue(originPriceRef)}
                        key={inputKey}
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">售價</label>
                      <input
                        ref={priceRef}
                        name='price'
                        value={inputValue.price}
                        onChange={() => refValue(priceRef)}
                        key={inputKey}
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">產品描述</label>
                    <textarea
                      ref={descriptionRef}
                      name='description'
                      value={inputValue.description}
                      onChange={() => refValue(descriptionRef)}
                      key={inputKey}
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">說明內容</label>
                    <textarea
                      ref={contentRef}
                      name='content'
                      value={inputValue.content}
                      onChange={() => refValue(contentRef)}
                      key={inputKey}
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        ref={enableRef}
                        name='is_enabled'
                        checked={inputValue.is_enabled}
                        onChange={() => refValue(enableRef)}
                        key={inputKey}
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                onClick={() => {
                  setInputKey(inputKey + 1 % freshKey);
                }}
                >
                取消
              </button>
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => {
                setInputKey(inputKey + 1 % freshKey);

                handleUpdateProduct(action);
                
              }}>確認</button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        data-bs-backdrop="static">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除 
              <span className="text-danger fw-bold">{inputValue.title}</span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                取消
              </button>
              <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => handleUpdateProduct(action)}>
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
