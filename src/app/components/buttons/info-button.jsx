"use client";
import { useState } from "react";
import { createPortal } from "react-dom";

import "styles/css/components/popups.css";

export default function InfoButton() {
  // State to control the visibility of the popup
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Info button that triggers the popup when clicked */}
      <button className="info" onClick={() => setIsOpen(true)}>
        i
      </button>

      {/* Render the popup using createPortal if isOpen is true */}
      {isOpen &&
        createPortal(
          <div className="popup">
            <div className="box">
              <div className="text">
                {/* Popup content explaining how the application works */}
                <h2>How does it work?</h2>
                <hr />
                <p>First of all, you need to click on the <strong>&quot;Create with AI&quot;</strong> button, because you will then allow you to upload text files in <strong>.txt</strong> format in the form instead of the finished recording.</p>
                <p>If you don&apos;t have a self-made <strong>.mp3</strong> file of your audiobook recording, you can use AI technology to create your own audiobook.</p>
                <p>All you need to do is to transcribe the entire book into <strong>.txt</strong> file format and split them into separate files in which each file has one chapter. Each file can have a maximum of <strong>1000 characters</strong>. You don&apos;t have to worry about punctuation.</p>
                <p>Remember that the files must be uploaded sequentially according to the collinear, otherwise you will not be able to edit them.</p>
                <p>After uploading all the files individually, they will be sent one by one to our database where AI will turn them into <strong>.mp3</strong> files and then combine them into one large file for other users to listen to.</p>
                <p>Also remember to add the title, cover and description of your book so users know what the book is.</p>
              </div>
              {/* Close button to hide the popup */}
              <button onClick={() => setIsOpen(false)} className="close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>,
          document.body // Portal renders the popup to the body element in the DOM
        )
      }
    </>
  );
};