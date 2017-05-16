package pages;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/16/17.
 */

public class DropDownMenu extends WebAppPage {

    private String dropDownButton = ".//*[@class='dropdown']/a";
    private String companiesDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Companies']";
    private String workProjectsDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Work Projects']";
    private String ingestionsDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Ingestion Configurations']";
    private String usersDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Users']";
    private String schemasDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Schemas']";
    private String taxonomyDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Taxonomy']";
    private String taxonomyValuesDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Taxonomy Field Values']";
    private String logoutDropDownButton = ".//*[@class='dropdown open']/descendant::a[text()='Logout']";

    public CompanyPage openCompanyPage() throws MalformedURLException
    {
        clickOnElement(By.xpath(companiesDropDownButton));
        return new CompanyPage();
    }

    public ProjectPage openProjectPage() throws MalformedURLException
    {
        clickOnElement(By.xpath(workProjectsDropDownButton));
        return new ProjectPage();
    }

    public IngestionConfigPage openIngestionConfigPage() throws MalformedURLException
    {
        clickOnElement(By.xpath(ingestionsDropDownButton));
        return new IngestionConfigPage();
    }

    public UserPage openUserPage() throws MalformedURLException
    {
        clickOnElement(By.xpath(usersDropDownButton));
        return new UserPage();
    }
}
