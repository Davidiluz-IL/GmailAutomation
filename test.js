const puppeteer = require('puppeteer');
const delayy = ms => new Promise(res => setTimeout(res, ms));
let browser;
let  files;
let fs = require('fs');  
let links; 
const path = require("path");

async function loginToGmail(page){
    try{
    await delayy(725)
    await page.type('input[type="email"]', 'Mail@Mail.com',{delay:100});
    await delayy(1956)
    await page.evaluate(() => { document.querySelectorAll('button')[2].click()})
    await delayy(1989)
    await page.waitForSelector('[type="password"]');
    await page.type('[type="password"]', 'Password',{delay:100});
    await delayy(1786)
    await page.evaluate(() => {document.querySelectorAll('button')[1].click()})
    }
    catch(e){
        try{
            await delayy(324)
            await page.evaluate(() => {document.querySelector('li div').click()})
            try{
                await delayy(5000)
                await page.evaluate(() => {document.querySelector('[data-is-touch-wrapper="true"] button').click()})
        }catch{}
        console.log("Logged in to gmail")
            return 1;
        }
        catch(e){
            console.log("problem with login automation")
            return 0;
        }
    }
} 

async function deleteAllEmails(page){
    try{
        await delayy(500)
    await page.waitForSelector('ul li[data-tooltip="Delete"]');
    await page.evaluate(() => {
        let emails= document.querySelectorAll('ul li[data-tooltip="Delete"]');
        emails.forEach((e)=>e.click())
    });
    console.log("MailBox is Clean !")
    return 1;
}
catch(e)
{
    try{
        await page.evaluate(() => {document.querySelector('ul li[data-tooltip="Delete"]')==null})
        console.log("MailBox is Clean !")
        return 1;
    }
        catch(e){
            console.log("problem with delete emails function !")
    console.log(e)
    return 0;
        }
}

}

//counter helps us to limit the time to click an emails
async function clickOnRmailBySubject(page,MailSubject,counter){
    try{
        if(counter>=5)
        {
            console.log("Email didnt found/ Takes more than 2 minutes")
            return 0;
        }
        await page.waitForSelector('[role="gridcell"] [role="link"]');
        let clicked=0;
        clicked = await page.evaluate((MailSubject) => {
            let clicked=0;
            document.querySelectorAll('[role="gridcell"] [role="link"]').forEach(e=>{
                if(e.textContent.includes(MailSubject)) {
                    e.parentElement.parentElement.click();
                    clicked=1;
                }
            })
            return clicked;
        },MailSubject);
        if(clicked==1){
        console.log("Mail clicked")
        return 1;
        }
        else{
            await delayy(2876);
            awaitclickOnRmailBySubject(page,MailSubject,counter+3)
        }
    }
    catch(e)
    {
        await delayy(2876);
        clickOnRmailBySubject(page,MailSubject,counter+3)
    }

}

async function clickLinkAndOpenInNewPage(Gmailpage,targetPage,selector){
    try{
        let link='';
        delayy(500)
        await Gmailpage.waitForSelector(selector);
        link = await Gmailpage.evaluate((selector,link) => {
        return document.querySelector(selector).href.toString()
    },selector);
    console.log(link)
    await targetPage.goto(link,{
        waitUntil:'networkidle2'
    });
    return 1;
    }
    catch(e){
        console.log("problem with clicking the link");
        console.log(e)
        return 0 ;
    }
}

async function main(){
    
    try{
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport:false,
            userDataDir:"./GmailChrome" 
         })

         const Gmailpage = await browser.newPage();
         const page=await browser.newPage();

         await Gmailpage.goto("https://accounts.google.com/AccountChooser/signinchooser?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&flowName=GlifWebSignIn&flowEntry=AccountChooser",{
            waitUntil:'networkidle2'
        });

        await loginToGmail(Gmailpage);

        await delayy(1500)

        // await deleteAllEmails(Gmailpage);
        // await delayy(1500)
        let MailSubject="2 new jobs for";
        await clickOnRmailBySubject(Gmailpage,MailSubject,0);

        await clickLinkAndOpenInNewPage(Gmailpage,page,'tbody tr td a');
            
           
    }
catch(E){console.log(E)}

}

main()
