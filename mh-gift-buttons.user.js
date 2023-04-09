// ==UserScript==
// @name         🐭️ MouseHunt - Gift Buttons
// @version      1.5.5
// @description  Add buttons to easily accept and return all daily gifts.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://i.mouse.rip/mouse.png
// @grant        none
// @run-at       document-end
// @require      https://cdn.jsdelivr.net/npm/mousehunt-utils@1.5.2/mousehunt-utils.js
// ==/UserScript==

((function () {
  /**
   * Send the gifts.
   *
   * @param {string} buttonClass The class of the button to click.
   */
  const sendGifts = (buttonClass) => {
    if (hg && hg.views?.GiftSelectorView?.show) { // eslint-disable-line no-undef
      hg.views.GiftSelectorView.show(); // eslint-disable-line no-undef
    }

    const innerButtons = document.querySelectorAll('.giftSelectorView-friendRow-action.' + buttonClass + ':not(.disbled):not(.selected)');
    if (! innerButtons.length) {
      return;
    }

    innerButtons.forEach((button) => {
      button.click();
    });

    const confirm = document.querySelector('.mousehuntActionButton.giftSelectorView-action-confirm.small');
    if (confirm) {
      confirm.click();
    }
  };

  /**
   * Make a button.
   *
   * @param {string} text        The text to put in the button.
   * @param {string} buttonClass Class selector to use to grab the button.
   * @param {string} limitClass  Class selector to use to grab the limit.
   */
  const makeButton = (text, buttonClass, limitClass) => {
    const btn = document.createElement('a');
    btn.innerHTML = text;

    const limit = document.querySelector('.giftSelectorView-num' + limitClass + 'ActionsRemaining');
    if (limit && limit.innerText === '0') {
      btn.classList.add('disabled');
      btn.classList.add('disabled');
    } else {
      btn.addEventListener('click', () => {
        sendGifts(buttonClass);
      });
    }

    return btn;
  };

  /**
   * Make the buttons and add them to the page.
   */
  const makeButtons = () => {
    if (document.getElementById('bulk-gifting-gift-buttons')) {
      return;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'bulk-gifting-gift-buttons';

    const acceptButton = makeButton('Accept All', 'claim', 'Claim');
    buttonContainer.appendChild(acceptButton);

    const returnButton = makeButton('Accept & Return All', 'return', 'Send');
    buttonContainer.appendChild(returnButton);

    const giftFooter = document.querySelector('.giftSelectorView-inbox-footer');
    if (giftFooter && giftFooter.firstChild) {
      giftFooter.insertBefore(buttonContainer, giftFooter.firstChild);
    }
  };

  /**
   * On a sucessful send, close the modal.
   *
   * @param {Object} request The request.
   */
  const checkForSuccessfulGiftSend = (request) => {
    if (! request || 'undefined' === request.friends_sent_gifts || ! request.friends_sent_gifts.length > 1) {
      return;
    }

    const okayBtn = document.querySelector('.giftSelectorView-confirmPopup-submitConfirmButton');
    if (! okayBtn) {
      return;
    }

    setTimeout(() => {
      okayBtn.click();

      if ('undefined' === typeof activejsDialog || ! activejsDialog || ! activejsDialog.hide) { // eslint-disable-line no-undef
        return;
      }

      activejsDialog.hide(); // eslint-disable-line no-undef
    }, 2000);
  };

  addStyles(`#bulk-gifting-gift-buttons {
    margin: 0 0 10px;
    text-align: right;
  }

  #bulk-gifting-gift-buttons a {
    display: inline-block;
    padding: 0 10px;
    font-size: 12px;
    line-height: 30px;
    color: #000;
    text-align: center;
    text-decoration: none;
    background-color: #eee;
    border: 1px solid #000;
    border-radius: 5px;
    box-shadow: 1px 1px 1px #eee;
  }

  #bulk-gifting-gift-buttons a:last-child:hover,
  #bulk-gifting-gift-buttons a:hover, #bulk-gifting-gift-buttons a:last-child:focus,
  #bulk-gifting-gift-buttons a:focus {
    background-color: #ffae00;
    box-shadow: 0 0 5px #fff inset, 1px 1px 1px #fff;
  }

  #bulk-gifting-gift-buttons a:last-child {
    margin-left: 10px;
    background-color: #fff600;
  }

  #bulk-gifting-gift-buttons a.disabled,
  #bulk-gifting-gift-buttons a:last-child.disabled {
    background-color: #eee;
  }

  #bulk-gifting-gift-buttons a.disabled:hover, #bulk-gifting-gift-buttons a.disabled:focus {
    cursor: default;
    box-shadow: 0 0 3px #f00;
  }

  .giftSelectorView-inbox-giftContainer {
    height: auto;
    min-height: 300px;
    max-height: 75vh;
  }

  .giftSelectorView-inbox-giftRow.complete {
    height: 25px;
    padding-top: 5px;
    padding-left: 15px;
    border: none;
    box-shadow: none;
  }

  .giftSelectorView-inbox-giftRow.complete .giftSelectorView-inbox-gift-thumb {
    display: inline;
  }

  .giftSelectorView-inbox-giftRow.complete .itemImage {
    display: inline-block;
    width: 25px;
    height: 25px;
  }

  .giftSelectorView-inbox-giftRow.complete .giftSelectorView-inbox-gift-details {
    width: 90%;
  }
  `);

  onAjaxRequest(makeButtons, '/managers/ajax/users/socialGift.php');
  onAjaxRequest(checkForSuccessfulGiftSend, '/managers/ajax/users/socialGift.php');

  const buttonLink = document.querySelector('#hgbar_freegifts');
  if (buttonLink) {
    buttonLink.addEventListener('click', function () {
      makeButtons();
    });
  }
})());
