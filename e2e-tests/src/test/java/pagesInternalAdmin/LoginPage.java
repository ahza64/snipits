package pagesInternalAdmin;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;

import java.net.MalformedURLException;

import setup.Driver;
import setup.WebAppPage;

/**
 * Created by az on 4/6/17.
 */

public class LoginPage extends WebAppPage {

    public LoginPage(boolean isLaunching)
    {
        if(isLaunching)
            launchWebsite();
        openURL(Driver.getInternalAdminAppURLAppURL());
        validate();
    }

    private void validate(){
        LOGGER.info(this.driver.getTitle());
        assertTitle("Dispatchr Admin");
    }

    //WebElements
    @FindBy(how = How.XPATH, using = ".//*[@class='col-lg-4 col-md-4 col-sm-10 col-xs-12']/descendant::input[1]")
    static private WebElement userNameField;

    @FindBy(how = How.XPATH, using = ".//*[@class='col-lg-4 col-md-4 col-sm-10 col-xs-12']/descendant::input[2]")
    static private WebElement passwordField;

    @FindBy(how = How.XPATH, using = ".//*[@class='col-lg-4 col-md-4 col-sm-10 col-xs-12']/descendant::span[text()='ADMIN LOGIN']")
    static private WebElement loginBtn;

    //Action methods
    public CompanyPage login(String username, String password) throws MalformedURLException {
        clearAndType(userNameField, username);
        clearAndType(passwordField, password);
        holdOnForASec();
        clickOnElement(loginBtn);
        LOGGER.info("Clicked Login Button");
        waitForPageLoadComplete();
        return new CompanyPage();
    }
}
