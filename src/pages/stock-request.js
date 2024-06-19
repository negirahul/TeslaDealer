import React, { useEffect } from "react";
import { useState } from 'react';
import '../pages/intro.css';
import HeaderBack from '../pages/header-back';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import * as Icon from "react-bootstrap-icons";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from "axios";

import Swal from 'sweetalert2';

import { Filesystem, Directory } from '@capacitor/filesystem';

function StockRequest({ userDetails }) {

  const [disabledButton, setdisabledButton] = useState(false);

  const [punchModal, setPunchModal] = useState(false);
  const punchModalClose = () => setPunchModal(false);
  const punchModalShow = () => setPunchModal(true);

  const [placeModal, setPlaceModal] = useState(false);
  const placeModalClose = () => setPlaceModal(false);
  const placeModalShow = () => setPlaceModal(true);

  const [details, setDetailsModal] = useState(false);
  const [popOrderDetails, setPopOrderDetails] = useState(null);
  const detailsModalClose = () => setDetailsModal(false);
  const detailsModalShow = (details) => {
    setPopOrderDetails(details);
    console.log(details);
    setDetailsModal(true);
  }

  function downloadUrl(url){
    axios.get(url,{responseType:"blob"}).then(function (response) {
      var res = response.data;
      var reader = new FileReader();
      reader.readAsDataURL(res);
      reader.onloadend = function(){
        let base64 = reader.result.toString();
        Filesystem.writeFile({
          path: Math.floor((Math.random() * 1000000000) + 1)+"invoice.pdf",data: base64,directory: Directory.Documents
        }).then((res)=>{
          console.log(res.uri)
          notify("success", "Invoice saved in your directory");
        },(err)=>{
          notify("alert", "Something went wrong");
        })
      }
    });
  }

  const [downloadFile, setDownloadFile] = useState(null);

  const getFormattedDate = (ddate, type) => {
    let dd = new Date(ddate);

    let day = dd.getDate();
    let month = dd.toLocaleString('en-US', { month: 'short' });
    let year = dd.getFullYear();

    if (type === 'day')
      return day
    else if (type === 'month')
      return month
    else if (type === 'year')
      return year
    else if (type === 'day_month_year')
      return day + ' ' + month + ' ' + year
    else if (type === 'month_year')
      return month + ' ' + year
  }

  const notify = (type, msg) => {
    if (type === 'success')
      toast.success(msg, { position: "top-center", newestOnTop: true, autoClose: 5000, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, theme: "dark" });
    else if (type === 'alert')
      toast.warn(msg, { position: "top-center", newestOnTop: true, autoClose: 5000, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, theme: "dark" });
    else if (type === 'error')
      toast.error(msg, { position: "top-center", newestOnTop: true, autoClose: 5000, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, theme: "dark" });
  }

  const [distributors, setDistributors] = useState([]);
  useEffect(() => {
    getDistributors();
  }, [userDetails])
  function getDistributors() {
    axios.get(process.env.REACT_APP_ADMIN_URL + 'dealersDistributor.php?userId=' + userDetails.id).then(function (response) {
      var data = response.data;
      if (data.statusCode === 200) {
        setDistributors(data.distributor);
      }
    });
  }
  
  const [productDetails, setProductDetails] = useState([]);
  useEffect(() => {
    getProductDetails();
  }, [userDetails])
  function getProductDetails() {
    axios.get(process.env.REACT_APP_ADMIN_URL + 'stockProductDetails.php').then(function (response) {
      var data = response.data;
      if (data.statusCode === 200) {
        setProductDetails(data.data);
      }
    });
  }

  const [punchDetails, setPunchDetails] = useState([]);
  const [placeDetails, setPlaceDetails] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  useEffect(() => {
    getAllOrderDetails();
  }, [userDetails])
  function getAllOrderDetails() {
    axios.get(process.env.REACT_APP_ADMIN_URL + 'allOrderDetails.php?userId=' + userDetails.id).then(function (response) {
      var data = response.data;
      // if(data.statusCode === 200){
      if (data.data.punch !== undefined)
        setPunchDetails(data.data.punch);
      else
        setPunchDetails([])

      if (data.data.place !== undefined)
        setPlaceDetails(data.data.place);
      else
        setPlaceDetails([])

      if (data.data.order !== undefined)
        setOrderDetails(data.data.order);
      else
        setOrderDetails([])
      // }
    });
  }

  const [punch, setPunch] = useState([]);
  const punchChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setPunch(values => ({ ...values, [name]: value }));
    // if (name == 'main_cat'){
    //   if(value == 'Battery'){

    //   }else if(value == 'Lubricant'){

    //   }else if(value == 'Spares Part'){

    //   }
    // }
    if (name == 'cat_id') {
      productDetails.forEach((employee, index) => {
        if (employee.id == value) {
          setModelDetails(employee.models);
        }
      })
    }
  }
  
  const [selectDistributor, setSelectDistributor] = useState(null);
  const changeDistributor = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setSelectDistributor(value);
  }

  const [modelDetails, setModelDetails] = useState([]);

  const punchSubmit = (event) => {
    event.preventDefault();
    if (punch === null) { notify("alert", "Please Fill All Details"); return; }
    if (punch.cat_id === undefined || punch.cat_id === '') { notify("alert", "Please Select Category"); return; }
    if (punch.model_id === undefined || punch.model_id === '') { notify("alert", "Please Select Model"); return; }
    if (punch.qty === undefined || punch.qty === '') { notify("alert", "Please Enter Quantity"); return; }
    if (punch.remark === undefined || punch.remark === '') { notify("alert", "Please Enter Remark"); return; }

    setdisabledButton(true);
    axios.post(process.env.REACT_APP_ADMIN_URL + 'punchProduct.php', { punch, userDetails, order_type: 1 }).then(function (response) {
      var data = response.data;
      if (data.statusCode === 200) {
        notify("success", data.msg);
      } else if (data.statusCode === 201) {
        notify("alert", data.msg);
      }
      event.target.reset();
      setPunchModal(false);
      setPunch(null);
      getAllOrderDetails();
      setdisabledButton(false);
    });
  }

  const deletePunch = (id) => {
    Swal.fire({
      title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post(process.env.REACT_APP_ADMIN_URL + 'deletePunch.php', { id }).then(function (response) {
          var data = response.data;
          if (data.statusCode === 200) {
            notify("success", data.msg);
          } else if (data.statusCode === 201) {
            notify("alert", data.msg);
          }
          getAllOrderDetails();
        });
      }
    })
  }

  const [invoice, setInvoice] = useState(null);
  const invoiceChange = (event) => {
    if (event.target.files[0] !== undefined) {
      let reader = new FileReader();
      reader.onload = function (event) {
        let changeImage = event.target.result;
        setInvoice(changeImage);
      }
      reader.readAsDataURL(event.target.files[0]);
    } else {
      setInvoice(null);
    }
  }

  const confirmPunchOrder = () => {
    if (invoice === null) { notify("alert", "Please select bill copy before confirm."); return; }
    Swal.fire({
      title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, do it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post(process.env.REACT_APP_ADMIN_URL + 'confirmPunchOrder.php', { userDetails, invoice }).then(function (response) {
          var data = response.data;
          if (data.statusCode === 200) {
            notify("success", data.msg);
          } else if (data.statusCode === 201) {
            notify("alert", data.msg);
          }
          setInvoice(null);
          getAllOrderDetails();
        });
      }
    })
  }


  const placeSubmit = (event) => {
    event.preventDefault();
    if (punch === null) { notify("alert", "Please Fill All Details"); return; }
    if (punch.cat_id === undefined || punch.cat_id === '') { notify("alert", "Please Select Category"); return; }
    if (punch.model_id === undefined || punch.model_id === '') { notify("alert", "Please Select Model"); return; }
    if (punch.qty === undefined || punch.qty === '') { notify("alert", "Please Enter Quantity"); return; }
    if (punch.remark === undefined || punch.remark === '') { notify("alert", "Please Enter Remark"); return; }

    setdisabledButton(true);
    axios.post(process.env.REACT_APP_ADMIN_URL + 'punchProduct.php', { punch, userDetails, order_type: 2 }).then(function (response) {
      var data = response.data;
      if (data.statusCode === 200) {
        notify("success", data.msg);
      } else if (data.statusCode === 201) {
        notify("alert", data.msg);
      }
      event.target.reset();
      setPlaceModal(false);
      setPunch(null);
      getAllOrderDetails();
      setdisabledButton(false);
    });
  }

  const confirmPlaceOrder = () => {
    if(selectDistributor === null || selectDistributor === ''){  notify("alert","Please Select Distributor First");return;  }
    Swal.fire({
      title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, do it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post(process.env.REACT_APP_ADMIN_URL + 'confirmPlaceOrder.php', { userDetails, distributor_id: selectDistributor }).then(function (response) {
          var data = response.data;
          if (data.statusCode === 200) {
            notify("success", data.msg);
          } else if (data.statusCode === 201) {
            notify("alert", data.msg);
          }
          setSelectDistributor(null);
          getAllOrderDetails();
        });
      }
    })
  }

  const receiveOrder = (orderId, status) => {
    Swal.fire({
      title: "Are you sure?",text: "You wasnt to update order status!",icon: "warning",showCancelButton: true,confirmButtonColor: "#3085d6",cancelButtonColor: "#d33",
      confirmButtonText: "Yes, do it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post( process.env.REACT_APP_ADMIN_URL + 'approvePunchOrder.php', {orderId, status, userId:userDetails.id} ).then(function(response){
          var data = response.data;
          if(data.statusCode === 200){
            notify("success",data.msg);
          }else if(data.statusCode === 201){
            notify("alert",data.msg);
          }
          getAllOrderDetails();
          setDetailsModal(false);
        });
      }
    });
  }

  const uploadInvoice = (orderId) => {
    if (invoice === null) { notify("alert", "Please select bill copy before confirm."); return; }
    Swal.fire({
      title: 'Are you sure?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, do it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post(process.env.REACT_APP_ADMIN_URL + 'invoiceUploadPlaceOrder.php', { orderId, invoice }).then(function (response) {
          var data = response.data;
          if (data.statusCode === 200) {
            notify("success", data.msg);
          } else if (data.statusCode === 201) {
            notify("alert", data.msg);
          }
          setInvoice(null);
          getAllOrderDetails();
          setDetailsModal(false);
        });
      }
    })
  }

  return (
    <div>
      <ToastContainer />
      <HeaderBack />
      <div className="container">
        <div className="mt-4">
          <Tabs defaultActiveKey="placed" id="uncontrolled-tab-example" className="mb-3" fill>

            <Tab eventKey="placed" title="New Order">
              <Button variant="primary" className="btn-black-form mb-3" onClick={placeModalShow}>
                <Icon.Basket className="me-2" />ADD ITEM IN CART
              </Button>
              <div className="mainbody" style={{height: "60vh"}}>
                <div className="bg-white shadow tab-body-edit">
                  {!placeDetails ? ''
                    : placeDetails.length === 0 ? (
                      <div className="empty-box shadow my-4 text-center">
                        <img src={require('../img/empty-box.png')} alt="" />
                        <h3>No Orders Yet</h3>
                        <p>Looks like you have not placed/ receive any stock yet!.</p>
                      </div>
                    )
                      : (
                        <div>
                          <div className="mb-3">
                            <select className="form-control" name="cat_id" id="cat_id" onChange={changeDistributor}>
                              <option value="">Select Distributor</option>
                              {!distributors ? (
                                <option>Loading data...</option>
                              ) : distributors.length === 0 ? (
                                <option>No data found</option>
                              ) : (distributors.map((item) => (
                                <option value={item.id}>{item.name} | {item.mobile_number}</option>
                              ))
                              )}
                            </select>
                          </div>
                          {placeDetails.map((item, index) => (
                            <div className="shop-item d-flex align-items-center">
                              <div className="cart-text-no w25">{index + 1}.</div>
                              <div className="cart-text w50">{item.cat_name}<span>Model No. {item.model_name} | Qty: {item.qty}</span></div>
                              <div className="w25"><button type="button" className="cart-item-btn" onClick={() => deletePunch(item.id)}><Icon.Trash3 /></button></div>
                            </div>
                          ))}
                          <hr />
                          <Button variant="primary" className="btn-black-form mb-3" onClick={confirmPlaceOrder}>CONFIRM ORDER</Button>
                        </div>
                      )
                  }
                </div>
              </div>
            </Tab>

            {/* <Tab eventKey="home" title="Punched Order">
              <Button variant="primary" className="btn-black-form mb-3" onClick={punchModalShow}>
                <Icon.Basket className="me-2" />ADD ITEM IN CART
              </Button>
              <div className="mainbody" style={{height: "60vh"}}>
                <div className="bg-white shadow tab-body-edit">
                  {!punchDetails ? ''
                    : punchDetails.length === 0 ? (
                      <div className="empty-box shadow my-4 text-center">
                        <img src={require('../img/empty-box.png')} alt="" />
                        <h3>No Orders Yet</h3>
                        <p>Looks like you have not placed/ receive any stock yet!.</p>
                      </div>
                    )
                      : (
                        <div>
                          {punchDetails.map((item, index) => (
                            <div className="shop-item d-flex align-items-center">
                              <div className="cart-text-no w25">{index + 1}.</div>
                              <div className="cart-text w50">{item.cat_name}<span>Model No. {item.model_name} | Qty: {item.qty}</span></div>
                              <div className="w25"><button type="button" className="cart-item-btn" onClick={() => deletePunch(item.id)}><Icon.Trash3 /></button></div>
                            </div>
                          ))}
                          <div className="mb-3">
                            <label htmlFor="bill_copy" className="form-label">Upload Bill Copy</label>
                            <input type="file" name="bill_copy" id="bill_copy" className="form-control" onChange={invoiceChange} accept="application/pdf" />
                          </div>
                          <hr />
                          <Button variant="primary" className="btn-black-form mb-3" onClick={confirmPunchOrder}>CONFIRM ORDER</Button>
                        </div>
                      )
                  }
                </div>
              </div>
            </Tab> */}

            <Tab eventKey="profile" title="Old Order">
              <div className="mainbody" style={{height: "75vh"}}>
                <div className="bg-white shadow tab-body-edit">

                  {!orderDetails ? ''
                    : orderDetails.length === 0 ? (
                      <div className="empty-box shadow my-4 text-center">
                        <img src={require('../img/empty-box.png')} alt="" />
                        <h3>No Orders</h3>
                        <p>No record available in your order history.</p>
                      </div>
                    )
                      : (orderDetails.map((item, index) => (
                        <div>
                          <div className="shop-item d-flex align-items-center">
                            <div className="cart-text-no w25">{index + 1}.</div>
                            <div className="cart-text w50">
                              Distributor: {item.dist_detail.name}, {item.dist_detail.mobile_number}<br/>
                              Product: {item.product} | Qty: {item.qty}
                              <span>
                                {getFormattedDate(item.order.ddate, 'day_month_year')} |
                                <strong>{{ '1': ' Punched', '2': ' Placed' }[item.order.order_type]} Order</strong>
                              </span>
                            </div>
                            {/* <div className="cart-icon w25 text-info">
                              <Icon.Check2Circle />
                            </div> */}
                            {{
                              '0':<div className="cart-icon w25 text-warning"><Icon.QuestionCircle /></div>, 
                              '1':<div className="cart-icon w25 text-success"><Icon.Check2Circle /></div>, 
                              '2':<div className="cart-icon w25 text-danger"><Icon.XCircle /></div>,
                              '3':<div className="cart-icon w25 text-success"><Icon.Check2Circle /></div>,
                              '4':<div className="cart-icon w25 text-success"><Icon.Check2Circle /></div>,
                              '5':<div className="cart-icon w25 text-success"><Icon.Check2Circle /></div>
                            }
                            [item.order.order_status]}
                          </div>
                          <div className="w-100"><button type="button" className="cart-item-btn cart-item-forn w-100" onClick={() => detailsModalShow(item)}>View Details</button>
                          </div>
                          <hr />
                        </div>
                      )))
                  }

                  {/* <div className="shop-item d-flex align-items-center">
                    <div className="cart-text-no w25">1.</div>
                    <div className="cart-text w50">Product: 25 | Qty: 40 <span>27 Oct 2023 | Order Placed</span></div>
                    <div className="cart-icon w25 text-success">
                      <Icon.Check2Circle />
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="w-50"><button type="button" className="cart-item-btn cart-item-forn w-100" onClick={detailsModalShow}>View Details</button>
                    </div>
                  </div>

                  <div className="shop-item d-flex align-items-center">
                    <div className="cart-text-no w25">1.</div>
                    <div className="cart-text w50">Product: 25 | Qty: 40 <span>27 Oct 2023 | Order Pending</span></div>
                    <div className="cart-icon w25 text-info">
                      <Icon.ArrowClockwise />
                    </div>
                  </div>
                  <div className="w-50"><button type="button" className="cart-item-btn cart-item-forn w-100" onClick={detailsModalShow}>View Details</button>
                  </div> */}

                </div>
              </div>
            </Tab>
          </Tabs>
        </div>

      </div>

      <Modal show={punchModal} onHide={punchModalClose} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={punchSubmit}>
            <div className="mb-3">
              <label htmlFor="main_cat" className="form-label">Select Main Category</label>
              <select className="form-control" name="main_cat" id="main_cat" onChange={punchChange}>
                <option value="">Select Main Category</option>
                <option>Battery</option>
                <option>Lubricant</option>
                <option>Spares Part</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="cat_id" className="form-label">Select Category</label>
              <select className="form-control" name="cat_id" id="cat_id" onChange={punchChange}>
                <option value="">Select Category</option>
                {!productDetails ? (
                  <option value="">Loading data...</option>
                ) : productDetails.length === 0 ? (
                  <option value="">No data found</option>
                ) : (productDetails.map((item) => (
                  punch.main_cat == undefined ? <option value="">Select Main Category</option> :
                    punch.main_cat.length == 0 ? <option value="">Select Main Category</option> :
                      punch.main_cat == 'Lubricant' ? 
                        item.group_id == 8 ? <option value={item.id} data-key={item.models} >{item.name}</option> : ''
                      : punch.main_cat == 'Spares Part' ? 
                        item.group_id == 9 ? <option value={item.id} data-key={item.models} >{item.name}</option> : ''
                      : punch.main_cat == 'Battery' ? 
                        (item.group_id != 8 && item.group_id != 9) ? 
                          <option value={item.id} data-key={item.models} >{item.name}</option> : ''
                      : <option value="">Select Main Category</option>
                ))
                )}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="model_id" className="form-label">Select Model</label>
              <select className="form-control" name="model_id" id="model_id" onChange={punchChange}>
                <option value="">Select Model</option>
                {!modelDetails ? (
                  <option>Loading data...</option>
                ) : modelDetails.length === 0 ? (
                  <option>No data found</option>
                ) : (modelDetails.map((item) => (
                  <option value={item.id}>{item.model_name}</option>
                ))
                )}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="qty" className="form-label">Qty.</label>
              <input type="text" className="form-control" name="qty" id="qty" onInput={punchChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="remark" className="form-label">Any Remark</label>
              <textarea className="form-control" name="remark" id="remark" onInput={punchChange}></textarea>
            </div>
            <Modal.Footer>
              <Button type="submit" variant="primary" className="btn-black-form" onClick={punchModalClose}>Add Item</Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={placeModal} onHide={placeModalClose} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={placeSubmit}>
            <div className="mb-3">
              <label htmlFor="main_cat" className="form-label">Select Main Category</label>
              <select className="form-control" name="main_cat" id="main_cat" onChange={punchChange}>
                <option value="">Select Main Category</option>
                <option>Battery</option>
                <option>Lubricant</option>
                <option>Spares Part</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="cat_id" className="form-label">Select Category</label>
              <select className="form-control" name="cat_id" id="cat_id" onChange={punchChange}>
                <option value="">Select Category</option>
                {!productDetails ? (
                  <option value="">Loading data...</option>
                ) : productDetails.length === 0 ? (
                  <option value="">No data found</option>
                ) : (productDetails.map((item) => (
                  punch.main_cat == undefined ? '' :
                    punch.main_cat.length == 0 ? '' :
                      punch.main_cat == 'Lubricant' ? 
                        item.group_id == 8 ? <option value={item.id} data-key={item.models} >{item.name}</option> : ''
                      : punch.main_cat == 'Spares Part' ? 
                        item.group_id == 9 ? <option value={item.id} data-key={item.models} >{item.name}</option> : ''
                      : punch.main_cat == 'Battery' ? 
                        (item.group_id != 8 && item.group_id != 9) ? 
                          <option value={item.id} data-key={item.models} >{item.name}</option> : ''
                      : ''
                ))
                )}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="model_id" className="form-label">Select Model</label>
              <select className="form-control" name="model_id" id="model_id" onChange={punchChange}>
                <option value="">Select Model</option>
                {!modelDetails ? (
                  <option>Loading data...</option>
                ) : modelDetails.length === 0 ? (
                  <option>No data found</option>
                ) : (modelDetails.map((item) => (
                  <option value={item.id}>{item.model_name} | {item.model_description}</option>
                ))
                )}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="qty" className="form-label">Qty.</label>
              <input type="text" className="form-control" name="qty" id="qty" onInput={punchChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="remark" className="form-label">Any Remark</label>
              <textarea className="form-control" name="remark" id="remark" onInput={punchChange}></textarea>
            </div>
            <Modal.Footer>
              <Button type="submit" variant="primary" className="btn-black-form" onClick={punchModalClose}>Add Item</Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={details} onHide={detailsModalClose} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {!popOrderDetails ? ''
            : popOrderDetails.length === 0 ? ''
              : (
                <div>
                  <div className="text-center">
                    <h6>
                      Order Date: {getFormattedDate(popOrderDetails.order.ddate, 'day_month_year')}<br />
                      Status: Order {{ '0': ' Pending', '1': ' Accepted', '2': ' Rejected', '3': ' Dispatched', '4': ' Delivered', '5': ' Received' }[popOrderDetails.order.order_status]}
                    </h6>
                  </div>
                  <hr />
                  {popOrderDetails.details.map((item, index) => (
                    <div className="shop-item d-flex align-items-center">
                      <div className="cart-text-no w25">{index + 1}.</div>
                      <div className="cart-text w50">{item.cat_name} <span>Model No. {item.model_name} | Qty: {item.qty}</span></div>
                      {/* <div className="w25"><button type="button" className="cart-item-btn"><Icon.CheckAll /></button></div> */}
                    </div>
                  ))}
                  
                  {popOrderDetails.order.order_type == 2 ? 
                    popOrderDetails.order.order_status == 4 ?
                      <button type="button" className="cart-item-btn cart-item-forn w-100 mt-3" onClick={() => receiveOrder(popOrderDetails.order.id, 5)}>Order Received</button>
                    : 
                    popOrderDetails.order.order_status == 5 ?
                      popOrderDetails.order.bill_copy === null ?
                        <div>
                          <hr />
                          <div className="">
                            <label className="form-label">Upload Bill Copy</label>
                            <input type="file" name="bill_copy" className="form-control" onChange={invoiceChange} accept="application/pdf" />
                          </div>
                          <button type="button" className="cart-item-btn cart-item-forn w-100 mt-3" onClick={() => uploadInvoice(popOrderDetails.order.id)}>Upload Invoice</button>
                        </div>
                      : 
                        <button type="button" className="cart-item-btn cart-item-forn w-100 mt-3" 
                          onClick={() => downloadUrl(process.env.REACT_APP_ADMIN_URL + popOrderDetails.order.bill_copy)}>Download / View Invoice
                        </button>
                    : ''
                  : 
                    popOrderDetails.order.bill_copy === null ? ''
                    : 
                      <button type="button" className="cart-item-btn cart-item-forn w-100 mt-3" 
                        onClick={() => downloadUrl(process.env.REACT_APP_ADMIN_URL + popOrderDetails.order.bill_copy)}>Download / View Invoice
                      </button>
                  }
                </div>
              )
          }

          {/* <div className="text-center">
            <h6>Order Date: 27 Oct 2023<br />
              Status: Placed</h6>
          </div>
          <hr />

          <div className="shop-item d-flex align-items-center">
            <div className="cart-text-no w25">1.</div>
            <div className="cart-text w50">Invertor Battery <span>Model No. XYZ123 | Qty: 1</span></div>
            <div className="w25"><button type="button" className="cart-item-btn"><Icon.CheckAll /></button></div>
          </div>

          <div className="shop-item d-flex align-items-center">
            <div className="cart-text-no w25">2.</div>
            <div className="cart-text w50">Car Battery <span>Model No. XYZ123 | Qty: 1</span></div>
            <div className="w25"><button type="button" className="cart-item-btn"><Icon.CheckAll /></button></div>
          </div>

          <div className="shop-item d-flex align-items-center">
            <div className="cart-text-no w25">3.</div>
            <div className="cart-text w50">Bike Battery <span>Model No. XYZ123 | Qty: 1</span></div>
            <div className="w25"><button type="button" className="cart-item-btn"><Icon.CheckAll /></button></div>
          </div> */}
        </Modal.Body>
      </Modal>

    </div>
  );
}
export default StockRequest;