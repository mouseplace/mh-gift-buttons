// ==UserScript==
// @name         🐭️ MouseHunt - Gift Buttons
// @version      1.0.0
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
	const makeButtons = () => {
		if (document.getElementById('bulk-gifting-gift-buttons')) {
			return;
		}

		const acceptButton = document.createElement('a');
		acceptButton.innerHTML = 'Accept All';
		acceptButton.addEventListener('click', () => {
			// eslint-disable-next-line no-undef
			hg.views.GiftSelectorView.show();
			const acceptButtons = document.querySelectorAll('.giftSelectorView-friendRow-action.claim:not(.disbled):not(.selected)');
			acceptButtons.forEach((button) => {
				button.click();
			});
			document.querySelector('.mousehuntActionButton.giftSelectorView-action-confirm.small').click();
		});

		const acceptAndReturnButton = document.createElement('a');
		acceptAndReturnButton.innerHTML = 'Accept & Return All';
		acceptAndReturnButton.addEventListener('click', () => {
			// eslint-disable-next-line no-undef
			hg.views.GiftSelectorView.show();
			const acceptButtons = document.querySelectorAll('.giftSelectorView-friendRow-action.return:not(.disbled):not(.selected)');
			acceptButtons.forEach((button) => {
				button.click();
			});
			document.querySelector('.mousehuntActionButton.giftSelectorView-action-confirm.small').click();
		});

		const buttonContainer = document.createElement('div');
		buttonContainer.id = 'bulk-gifting-gift-buttons';
		buttonContainer.appendChild(acceptButton);
		buttonContainer.appendChild(acceptAndReturnButton);

		const giftFooter = document.querySelector('.giftSelectorView-inbox-footer');
		giftFooter.insertBefore(buttonContainer, giftFooter.firstChild);
	};

	(() => {
		const style = document.createElement('style');
		style.innerHTML = `
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
		`;
		document.head.appendChild(style);

		const ajaxFinished = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function () {
			this.addEventListener('load', function () {
				if (this.responseURL === 'https://www.mousehuntgame.com/managers/ajax/users/socialGift.php') {
					makeButtons();
				}
			});
			ajaxFinished.apply(this, arguments);
		};

		document.querySelector('#hgbar_freegifts').addEventListener('click', function () {
			makeButtons();
		});
	})();
})());
