const { chromium } = require('playwright');
const assert = require('assert');

const email = "shashank05april@gmail.com";
const pageName = "LeadpagesTest";
const password = process.argv[2];
const StartTemplate = "Buster Business";
const SendGuideButtonText = "SEND ME THE GUIDE";
const expectedText = "Enter Your Email to Get Your Free Guide";

(async () => {
	// Path to the Chrome executable
	// Update this path if Chrome is installed elsewhere
	const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

	// Launch a new browser instance
	const browser = await chromium.launch({
		executablePath: chromePath, // Specify the Chrome executable path
		headless: false // Set to true if you want to run in headless mode

	});

	// Create a new page
	const page = await browser.newPage();

	// Get the screen dimensions
	const screen = await page.evaluate(() => {
		return { width: window.screen.availWidth, height: window.screen.availHeight };
	});

	await page.setViewportSize(screen);

	try {

		// Navigate to the Login page
		console.log("Go to Leadpages login page");
		await page.goto('https://my.leadpages.com/login');

		// Enter the credentials
		console.log("Enter the username: " + email + "and password: **********");
		await page.fill('[name="email"][type="email"]', email);
		await page.fill('[name="password"][type="password"]', password);

		// Screenshot of login page
		await page.screenshot({ path: '1_Login.png' });

		// Click on login
		console.log("Click on the Login button");
		await page.click('[type="submit"][data-qa-selector="login-submit"]');

		// Click on 'Landing Pages' menu item
		console.log("Click on 'Landing Pages' menu item");
		await page.click('[href="#/pages"]');

		// Screenshot of Landing Pages
		await page.screenshot({ path: '2_LandingPages.png' });

		// Click on 'Create New Landing Page' button
		console.log("Click on 'Create New Landing Page' button");
		await page.getByText('Create New Landing Page').click();

		// Define the selector for the element you want to scroll to
		const TemplateImage = 'img[alt="Buster Business"]';

		// Wait for the element to be present in the DOM
		console.log("Scroll down to the 'Buster Business' template to display...");
		await page.waitForSelector(TemplateImage);

		// Scroll the element into view if it is not fully visible
		await page.evaluate(selector => {
			const BusterBusinessImage = document.querySelector(selector);
			if (BusterBusinessImage) {
				BusterBusinessImage.scrollIntoView();
			}
		}, TemplateImage);

		// Screenshot of Template after scrolling down
		await page.screenshot({ path: '3_TemplateList.png' });

		// xpath of the list of all the templates
		let imageAbsPath = '//body/div[@id=\'main\']/div[3]/div[1]/div[1]/div[2]/div[1]/div[3]/div[1]/div[1]';

		// length of all the available templates
		const TotalTemplate = await page.$eval(imageAbsPath, element => element.children.length);

		// Finding the desired template index using the loop
		for (let i = 1; i <= TotalTemplate; i++) {
			//Condition is to match with the desired template and exit the loop 
			// console.log(await page.$eval(imageAbsPath+ "/div[" + i + "]/p", element => element.textContent));

			if (await page.$eval(imageAbsPath + "/div[" + i + "]/p", element => element.textContent) === StartTemplate) {
				imageAbsPath += "/div[" + i + "]";
				break;
			}
		}

		// Updated the xpath to be able to find and click click on 'Start Building' of the desired template
		imageAbsPath += '/div[1]/div[1]/div[2]/div[1]/button[1]';
		await page.waitForSelector(imageAbsPath);

		// Hover over the 'Buster Business' image
		console.log("Hover over the '" + StartTemplate + "'")
		await page.hover(imageAbsPath);

		// Screenshot of hovering over the desired template
		await page.screenshot({ path: '4_HoveringOverTemplate.png' });

		// Click on 'Start Building' 
		console.log("Click on the 'Start Building' button in the template: " + StartTemplate);
		await page.click(imageAbsPath);

		// Enter the Page Name
		console.log("Enter the page name: " + pageName);
		await page.fill('input[id="nameSetup"][type="text"]', pageName);

		// Click on Continue
		console.log("Click on Continue");
		await page.click('button[type="submit"]');

		// Wait for the 'Send me the Guide' button availability
		console.log("Wait for the template to load...")
		const SendMeTheGuideElement = "span[data-link-type=\"leadbox\"]";
		await page.waitForSelector(SendMeTheGuideElement);

		// Hover over 'Send Me The Guide'
		console.log("Hover over the button: " + SendGuideButtonText);
		await page.hover(SendMeTheGuideElement);

		// Click on 'Edit Pop-up'
		console.log("Click on the button 'Edit Pop-up'");
		await page.click('span[data-qa-selector="edit-leadbox-button"]');

		// "Enter your email ...." text selector
		const EnterYourEmailElement = "h2[class=\"lp-headline text-align-center subhead\"]";
		await page.waitForSelector(EnterYourEmailElement);

		// Hover over the text
		console.log("Hover over the '" + expectedText + "' text");
		await page.hover(EnterYourEmailElement);

		// Click in the text field
		console.log("Click in the text");
		await page.click(EnterYourEmailElement);

		// Remove 'Business' from the text
		console.log("Remove 'Business' from the text");

		const removeBusiness = async () => {
			await page.$eval(EnterYourEmailElement, element => {
				element.innerHTML = element.innerHTML.replace('Business ', '');
			});
		};

		// First attempt to remove the word "Business"
		await removeBusiness();

		// Use a loop to keep removing "Business" word if it reappears
		while ((await page.$eval(EnterYourEmailElement, element => element.textContent)).trim() !== expectedText) {
			console.log("while loop.........");
			await removeBusiness();
		}

		// Click in the text field
		await page.click(EnterYourEmailElement);

		// Select all the text
		console.log("Press Ctrl + A to select all the text");
		await page.keyboard.press('Control+A');

		// Click on Bold button
		console.log("Click on B icon to make text bold");
		const BoldIcon = "button[aria-label=\"Bold\"]";
		await page.waitForSelector(BoldIcon);
		await page.click(BoldIcon);

		// Verify the Bold feature worked on the text
		//console.log("Verify the Bold feature worked");
		//const strongElement = await page.$(`${EnterYourEmailElement} strong`);
		//assert.notStrictEqual(strongElement, null, 'The strong child element is not present');

		// Click on Text Window Close button
		console.log("Click on the X icon in the Text window");
		await page.click('button[data-qa-selector="view-title-close-button"][aria-label="Close"]');

		// Click on Preview button
		console.log("Click on the Preview button");
		await page.click('button[data-qa-selector="preview-button"]');

		// Switch to Preview frame
		const iframeSelector = 'iframe[id="previewIframe"]';

		// Get the frame handle
		const iframeElementHandle = await page.waitForSelector(iframeSelector);
		const frame = await iframeElementHandle.contentFrame();

		// Click on the button: SEND ME THE GUIDE
		console.log("Click on the button: " + SendGuideButtonText);
		await frame.getByText(SendGuideButtonText).click();

		// Verify the updated text
		const actualText = await page.$eval(EnterYourEmailElement, element => element.textContent);
		console.log("Verify the actual string '" + actualText + "' is same as the expected string '" + expectedText + "'");
		assert.strictEqual(actualText.trim(), expectedText, 'The texts do not match');

	} catch (error) {
		// Print the error if any
		console.error('Error: ', error);

	}

	finally {
		// Close the browser
		await browser.close();
	}
})();
