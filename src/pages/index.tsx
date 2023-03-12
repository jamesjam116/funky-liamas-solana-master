/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home: NextPage = () => {
  return (
    <>
      <Header />
      <div className="main-page">
        <div className="container">
          <div className="image-banner">
            {/* <img src="/img/logo@text.svg" className="logo-text" alt="" /> */}
            <div className="banner-logo">
              {/* eslint-disable-next-line */}
              <img
                src="/img/title-logo.png"
                title="Funky Llamas - Laze, Party and Get High"
                alt=""
              />
            </div>
            <div className="liamas-content">
              <div className="img-box">
                <img src="/img/liamas-5.png" className="img-origin" alt="" />
                <img src="/img/liamas-5-h.png" className="img-hover" alt="" />
              </div>
              <div className="img-box">
                <img src="/img/liamas-4.png" className="img-origin" alt="" />
                <img src="/img/liamas-4-h.png" className="img-hover" alt="" />
              </div>
              <div className="img-box">
                <img src="/img/liamas-3.png" className="img-origin" alt="" />
                <img src="/img/liamas-3-h.png" className="img-hover" alt="" />
              </div>
              <div className="img-box">
                <img src="/img/liamas-2.png" className="img-origin" alt="" />
                <img src="/img/liamas-2-h.png" className="img-hover" alt="" />
              </div>
              <div className="img-box">
                <img src="/img/liamas-1.png" className="img-origin" alt="" />
                <img src="/img/liamas-1-h.png" className="img-hover" alt="" />
              </div>
              <span className="hi-there">
                <img src="/img/hi.svg" alt="" />
              </span>
            </div>
            <p className="banner-title">Funkiest NFT Collection</p>
          </div>
          <div className="home-content">
            <p>
              Laze, Party and Get High on this Funky Collection of 4500 Llamas
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Home;
