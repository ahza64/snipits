package pages;

import org.apache.commons.logging.Log;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/15/17.
 */

public class CompanyPage extends WebAppPage {

    private String addCompanyButton = ".//*[@class='col-lg-8 col-md-8 col-sm-8 col-xs-8']/descendant::span[text()='Add company']";
    private String addCompanyFormCancelButton = ".//span[text()='Cancel']";
    private String addCompanyFormConfirmButton = ".//span[text()='Confirm']";
    private String addCompanyNameField = ".//label[text()='Company Name']/following-sibling::input";
    private String companyTable = ".//*[@class='row']";
    private String dropDownButton = ".//*[@class='dropdown']/a";

    CompanyPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addCompanyButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddCompanyFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addCompanyFormCancelButton));
            LOGGER.info("Add Company Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Company Form is not displayed");
        }
    }

    public void addNewCompany(int namePostFix)
    {
        clickOnElement(By.xpath(addCompanyButton));
        waitForAddCompanyFormToDisplay();
        driver.findElement(By.xpath(addCompanyNameField)).sendKeys("Company" + namePostFix);
        clickOnElement(By.xpath(addCompanyFormConfirmButton));
    }


    public boolean verifyNewCompanyIsAdded(int namePostFix)
    {
        boolean isNewCompanyAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(companyTable)))
        {
            int totalRowsInCompanyTable = driver.findElements(By.xpath(".//*[@class='row']/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInCompanyTable));
            String companyNameDisplayed;

            for(int i=2; i<totalRowsInCompanyTable+2; i++)
            {
                companyNameDisplayed = driver.findElement(By.xpath(".//*[@class='row']/descendant::tr[" + i + "]/td[2]")).getText();
                LOGGER.info(companyNameDisplayed);
                if(companyNameDisplayed.contentEquals("Company" + namePostFix))
                {
                    LOGGER.info("Company Added is Found");
                    isNewCompanyAdded = true;
                    break;
                }
            }
        }

        return isNewCompanyAdded;
    }
    public DropDownMenu clickDropDownMenu()
    {
        clickOnElement(By.xpath(dropDownButton));
        return new DropDownMenu();
    }

}
