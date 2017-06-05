package pagesIngestionInterface;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;

import java.net.MalformedURLException;

import pagesInternalAdmin.CompanyPage;
import setup.Driver;
import setup.WebAppPage;

/**
 * Created by az on 6/5/17.
 */

public class LoginPageII extends WebAppPage
{

    public LoginPageII(boolean isLaunching)
    {
        if(isLaunching)
            launchWebsite();
        openURL(Driver.getIngestionInterfaceAppURL());
        waitForPageLoadComplete();
        validate();
    }

    public void validate(){
        LOGGER.info(this.driver.getTitle());
        assertTitle("Dispatchr Service");
    }

    //WebElements
    @FindBy(how = How.XPATH, using = ".//div[text()='Email Address']/following-sibling::input")
    static private WebElement userNameField;

    @FindBy(how = How.XPATH, using = ".//div[text()='Password']/following-sibling::input")
    static private WebElement passwordField;

    @FindBy(how = How.XPATH, using = ".//span[text()='USER LOGIN']/parent::div/parent::div//parent::button")
    static private WebElement loginBtn;

    //Action methods
    public UploadPage login(String username, String password) throws MalformedURLException
    {
        clearAndType(userNameField, username);
        clearAndType(passwordField, password);
        holdOnForASec();
        clickOnElement(loginBtn);
        LOGGER.info("Clicked Login Button");
        waitForPageLoadComplete();
        return new UploadPage();
    }
}
