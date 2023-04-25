// ==UserScript==
// @name         🐭️ MouseHunt - Gift Buttons
// @version      1.6.1
// @description  Add buttons to easily accept and return all daily gifts.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://i.mouse.rip/mouse.png
// @grant        none
// @run-at       document-end
// @require      https://greasyfork.org/scripts/464008-mousehunt-utils-beta/code/%F0%9F%90%AD%EF%B8%8F%20MouseHunt%20Utils%20Beta.js?version=1175806
// ==/UserScript==

// @require      https://cdn.jsdelivr.net/npm/mousehunt-utils@1.5.2/mousehunt-utils.js
(function () {
  'use strict';

  /**
   * Send the gifts.
   *
   * @param {string}  buttonClass The class of the button to click.
   * @param {number}  limit       The number of gifts to send.
   * @param {boolean} reverse     Whether to reverse the order of the clicks.
   */
  const sendGifts = (buttonClass, limit = 15, reverse = false) => {
    if (hg && hg.views?.GiftSelectorView?.show) { // eslint-disable-line no-undef
      hg.views.GiftSelectorView.show(); // eslint-disable-line no-undef
    }

    const expand = document.querySelectorAll('.giftSelectorView-claimableGift');
    if (expand) {
      expand.forEach((el) => {
        el.classList.add('expanded');
      });
    }

    let innerButtons = document.querySelectorAll(`.giftSelectorView-friendRow-action.${buttonClass}:not(.disbled):not(.selected)`);
    if (! innerButtons.length) {
      return;
    }

    // If we're doing it in reverse order, reverse the array.
    if (getSetting('gift-buttons-reverse', false) || reverse) {
      innerButtons = Array.prototype.slice.call(innerButtons);
      innerButtons.reverse();
    }

    let sent = 0;
    innerButtons.forEach((button) => {
      if (sent >= limit) {
        return;
      }

      sent++;

      button.click();
    });

    const confirm = document.querySelector('.mousehuntActionButton.giftSelectorView-action-confirm.small');
    if (confirm) {
      confirm.click();
    }
  };

  const makePaidGiftsButton = (buttonContainer) => {
    const hasPaidGifts = document.querySelectorAll('.giftSelectorView-friendRow-returnCost');
    if (! hasPaidGifts.length) {
      return;
    }

    const paidGiftsButton = makeElement('button', ['mh-gift-button', 'mh-gift-buttons-paid-gifts'], 'Accept & Return Paid Gifts');
    paidGiftsButton.addEventListener('click', () => {
      hg.views.GiftSelectorView.show(); // eslint-disable-line no-undef
      hg.views?.GiftSelectorView.showTab('claim_paid_gifts', 'selectClaimableGift');

      let acceptedGifts = JSON.parse(localStorage.getItem('mh-gift-buttons-accepted-paid-gifts'));
      if (! acceptedGifts) {
        acceptedGifts = {};
      }

      const newAcceptedGifts = {};

      const gifts = document.querySelectorAll('.giftSelectorView-friendRow.paidgift');
      gifts.forEach((gift) => {
        const friendId = gift.getAttribute('data-snuid');
        const giftId = gift.parentNode.parentNode.parentNode.getAttribute('data-item-type');

        const acceptButton = gift.querySelector('.giftSelectorView-friendRow-action.claim');
        const returnButton = gift.querySelector('.giftSelectorView-friendRow-action.return');

        if (! giftId || ! friendId || ! acceptButton || ! returnButton) {
          return;
        }

        if (! acceptedGifts[ giftId ] || ! acceptedGifts[ giftId ].includes(friendId)) {
          returnButton.click();

          // save the gift as accepted.
          if (! newAcceptedGifts[ giftId ]) {
            newAcceptedGifts[ giftId ] = [];
          }

          newAcceptedGifts[ giftId ].push(friendId);
        } else {
          acceptButton.click();
        }
      });

      if (newAcceptedGifts !== acceptedGifts) {
        localStorage.setItem('mh-gift-buttons-accepted-paid-gifts', JSON.stringify(newAcceptedGifts));
      }
    });

    buttonContainer.appendChild(paidGiftsButton);
  };

  const makeAcceptButton = (buttonContainer) => {
    const acceptButton = makeElement('button', ['mh-gift-button', 'mh-gift-buttons-accept'], 'Accept All');
    const acceptLimit = document.querySelector('.giftSelectorView-numClaimActionsRemaining');
    if (acceptLimit && acceptLimit.innerText === '0') {
      acceptButton.classList.add('disabled');
    } else {
      acceptButton.addEventListener('click', () => {
        sendGifts('claim', acceptLimit ? parseInt(acceptLimit.innerText, 10) : 15);
      });
    }

    buttonContainer.appendChild(acceptButton);
  };

  const makeReturnButton = (buttonContainer) => {
    // Return button.
    const returnWrapper = makeElement('div', 'mh-gift-buttons-return-wrapper');
    const returnButton = makeElement('button', ['mh-gift-button', 'mh-gift-buttons-return'], 'Accept & Return All');
    const returnLimit = document.querySelector('.giftSelectorView-numSendActionsRemaining');
    if (returnLimit && returnLimit.innerText === '0') {
      returnButton.classList.add('disabled');
    } else {
      returnButton.addEventListener('click', () => {
        sendGifts('return', returnLimit ? parseInt(returnLimit.innerText, 10) : 25);
      });
    }

    returnWrapper.appendChild(returnButton);
    buttonContainer.appendChild(returnWrapper);
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

    makePaidGiftsButton(buttonContainer);
    makeAcceptButton(buttonContainer);
    makeReturnButton(buttonContainer);

    // Add the buttons to the page.
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
    margin-bottom: 10px;
    position: relative;
    display: flex;
    justify-content: flex-end;
  }

  #bulk-gifting-gift-buttons button {
    display: block;
    padding: 10px;
    font-size: 12px;
    color: #000;
    text-align: center;
    text-decoration: none;
    background-color: #eee;
    border: 1px solid #000;
    border-radius: 5px;
    box-shadow: 1px 1px 1px #eee;
  }

  #bulk-gifting-gift-buttons .mh-gift-buttons-accept {
    margin-right: 10px;
  }

  #bulk-gifting-gift-buttons .mh-gift-buttons-paid-gifts {
    margin-right: 10px;
  }

  #bulk-gifting-gift-buttons button:hover,
  #bulk-gifting-gift-buttons button:focus,
  #bulk-gifting-gift-buttons .mh-gift-buttons-return:hover,
  #bulk-gifting-gift-buttons .mh-gift-buttons-return:focus,
  #bulk-gifting-gift-buttons .mh-gift-buttons-accept-reverse:hover,
  #bulk-gifting-gift-buttons .mh-gift-buttons-accept-reverse:focus {
    background-color: #ffae00;
    box-shadow: 0 0 5px #fff inset, 1px 1px 1px #fff;
  }

  #bulk-gifting-gift-buttons button.disabled:hover,
  #bulk-gifting-gift-buttons button.disabled:focus {
    background-color: #eee;
    cursor: default;
    box-shadow: 0 0 3px #f00;
  }

  #bulk-gifting-gift-buttons .mh-gift-buttons-return {
    background-color: #fff600;
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

  const tab = addSettingsTab();

  addSetting(
    'Gift Buttons - Reverse Order',
    'gift-buttons-reverse',
    false,
    'Accept and send gifts from oldest to newest instead of newest to oldest.',
    {},
    tab
  );
}());
