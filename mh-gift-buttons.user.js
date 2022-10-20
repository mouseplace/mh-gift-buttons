// ==UserScript==
// @name         🐭️ MouseHunt - Gift Buttons
// @version      1.1.2
// @description  Add buttons to easily accept and return all daily gifts.
// @license      MIT
// @author       bradp
// @namespace    bradp
// @match        https://www.mousehuntgame.com/*
// @icon         https://brrad.com/mouse.png
// @grant        none
// @run-at      document-end
// ==/UserScript==

((function () {
	/**
	 * Add styles to the page.
	 *
	 * @param {string} styles The styles to add.
	 */
	const addStyles = (styles) => {
		const existingStyles = document.getElementById('mh-mouseplace-custom-styles');

		if (existingStyles) {
			existingStyles.innerHTML += styles;
		} else {
			const style = document.createElement('style');
			style.id = 'mh-mouseplace-custom-styles';

			style.innerHTML = styles;
			document.head.appendChild(style);
		}
	};

	/**
	 * Do something when ajax requests are completed.
	 *
	 * @param {Function} callback    The callback to call when an ajax request is completed.
	 * @param {string}   url         The url to match. If not provided, all ajax requests will be matched.
	 * @param {boolean}  skipSuccess Skip the success check.
	 */
	const onAjaxRequest = (callback, url = null, skipSuccess = false) => {
		const req = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener('load', function () {
				if (this.responseText) {
					let response = {};
					try {
						response = JSON.parse(this.responseText);
					} catch (e) {
						return;
					}

					if (response.success || skipSuccess) {
						if (! url) {
							callback(this);
							return;
						}

						if (this.responseURL.indexOf(url) !== -1) {
							callback(this);
						}
					}
				}
			});
			req.apply(this, arguments);
		};
	};

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
		giftFooter.insertBefore(buttonContainer, giftFooter.firstChild);
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

		okayBtn.click();

		if ('undefined' === typeof activejsDialog || ! activejsDialog || ! activejsDialog.hide) { // eslint-disable-line no-undef
			return;
		}

		activejsDialog.hide(); // eslint-disable-line no-undef
	};

	addStyles(`
		#bulk-gifting-gift-buttons {
			text-align: right;
			margin: 0 0 10px;
		}

		#bulk-gifting-gift-buttons a {
			display: inline-block;
			background-color: #eee;
			box-shadow: 1px 1px 1px #eee;
			border: 1px solid #000;
			border-radius: 5px;
			font-size: 12px;
			text-align: center;
			line-height: 30px;
			text-decoration: none;
			color: black;
			padding: 0 10px;
		}

		#bulk-gifting-gift-buttons a:last-child:hover,
		#bulk-gifting-gift-buttons a:hover {
			background-color: #ffae00;
			box-shadow: 0 0 5px #fff inset, 1px 1px 1px #fff;
		}

		#bulk-gifting-gift-buttons a:last-child {
			background-color: #fff600;
			margin-left: 10px;
		}

		#bulk-gifting-gift-buttons a.disabled,
		#bulk-gifting-gift-buttons a:last-child.disabled {
			background-color: #eee;
		}


		#bulk-gifting-gift-buttons a.disabled:hover {
			cursor: default;
			box-shadow: 0 0 3px #ff0000;
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
