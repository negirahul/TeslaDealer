import React from "react";
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../pages/intro.css';
import HeaderBack from '../pages/header-back';

function WarrantyClaim() {
    const [data, setData] = useState([]);
  
    const handleSelect = (e) => {
      const name = e.target.name;
      const value = e.target.value;
      setData(values => ({ ...values, [name]: value }));
      setShow(true);
    }


    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div>
            <HeaderBack />
            <div className="container">
    
<div className="empty-box shadow my-4">
<form>
        <div className="mb-3">
                    <label for="" className="form-label">Select Product</label>
                    <select className="form-control" name="product" onChange={handleSelect}>
                        <option value="">Select Product</option>
                        <option>Model: TPUX12456T</option>
                        <option>Model: TPUZ12455T</option>
                        <option>Model: TPUP89646T</option>
                    </select>
                </div>
            </form>                
            </div>


            <div className="empty-box shadow my-4 text-center">
                <img src={require('../img/empty-box.png')} alt=""/>
                <h3>No Claims</h3>
                <p>No Claims Submited Yet!</p> 
            </div>


            <div className="empty-box-2 shadow my-4 text-center">
                <h5>Product: Model: TPUP89646T</h5>
                <span>Warranty From 12 Oct. 2023 To 12 Ot. 2024</span>
                <hr/>
                <div className="d-flex align-items-center icon-box-4">
                    <div className="w-50 text-center border-end" >12 Oct. 2023</div>
                    <div className="w-50 text-center text-success" >Under Process</div>
                </div>
            </div>

</div>



      <Modal show={show} onHide={handleClose} aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title>Claim Warranty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form>
            <div className="text-center">
            <h5>Selected Product:<br/>{data.product}</h5>
            <p>Warranty From 12 Oct. 2023 To 12 Ot. 2024</p>
            </div>
            <hr/>

            <div className="mb-3">
                    <label for="" className="form-label">Select Reason</label>
                   <select className="form-control" cols="">
                    <option value="">Damage Product</option>
                    <option value="">Charging and other charging issue</option>
                   </select>
                </div>    
                <div className="mb-3">
                    <label for="" className="form-label">Any Message</label>
                   <textarea rows="" className="form-control" cols=""></textarea>
                </div>
                
            </form>

        </Modal.Body>
        <Modal.Footer>
        <Button variant="primary" className="btn-black-form">
            Submit
          </Button>
         
        </Modal.Footer>
      </Modal>


      <button type="button" className="btn-black text-center" onClick={handleShow}>RAISE A COMPLAINT</button>

        </div>
    );
}
export default WarrantyClaim;

