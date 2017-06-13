package pagesIngestionInterface;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import pagesInternalAdmin.CompanyPage;
import pagesInternalAdmin.IngestionConfigPage;
import pagesInternalAdmin.LoginPage;
import pagesInternalAdmin.ProjectPage;
import pagesInternalAdmin.SchemaPage;
import pagesInternalAdmin.TaxonomyPage;
import pagesInternalAdmin.TaxonomyValuesPage;
import pagesInternalAdmin.UserPage;
import setup.WebAppPage;

/**
 * Created by az on 5/16/17.
 */

public class DropDownMenuII extends WebAppPage {

    private String logoutDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Logout']";

    public LoginPageII performLogout() throws MalformedURLException
    {
        clickOnElement(By.xpath(logoutDropDownButton));
        return new LoginPageII(false);
    }
}
