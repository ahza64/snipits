package pages;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/17/17.
 */

public class SchemaPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectProjectButton = "//label[text()='Project']/parent::div/div/descendant::button";
    private String selectCompanyDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String selectProjectDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String addSchemaButton = ".//span[text()='Add Schema']";
    private String addSchemaFormCancelButton = ".//span[text()='Cancel']";
    private String addSchemaFormConfirmButton = ".//span[text()='Create Schema']";
    private String addSchemaNameField = ".//div[text()='Schema Name']/following-sibling::input";
    private String schemaTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total Project Schemas Found']/div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";

    SchemaPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addSchemaButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddSchemaFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addSchemaFormCancelButton));
            LOGGER.info("Add Schema Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Schema Form is not displayed");
        }
    }

    public void selectCompany(int namePostFix) throws MalformedURLException
    {
        selectEntity("Company", namePostFix, selectCompanyButton, selectCompanyDropDown);
    }

    public void selectProject(int namePostFix) throws MalformedURLException
    {
        selectEntity("Project", namePostFix, selectProjectButton, selectProjectDropDown);
    }

    public void addNewSchema(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addSchemaButton));
        waitForAddSchemaFormToDisplay();
        driver.findElement(By.xpath(addSchemaNameField)).sendKeys("Schema" + namePostFix);
        clickOnElement(By.xpath(addSchemaFormConfirmButton));
        LOGGER.info("Schema is Added");
        waitForElementToDisappear(By.xpath(addSchemaFormCancelButton));
    }

    public boolean verifyNewSchemaIsAdded(int namePostFix)
    {
        boolean isNewSchemaAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(schemaTable)))
        {
            int totalRowsInSchemaTable = driver.findElements(By.xpath(schemaTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInSchemaTable));
            if(totalRowsInSchemaTable > 1)
            {
                String schemaNameDisplayed;
                for (int i = 2; i < totalRowsInSchemaTable + 2; i++) {
                    schemaNameDisplayed = driver.findElement(By.xpath(schemaTable + "/descendant::tr[" + i + "]/td[4]")).getText();
                    if (schemaNameDisplayed.contentEquals("Config" + namePostFix)) {
                        String companyName, projectName;
                        companyName = driver.findElement(By.xpath(schemaTable + "/descendant::tr[" + i + "]/td[2]")).getText();
                        projectName = driver.findElement(By.xpath(schemaTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                        LOGGER.info(companyName + " " + projectName);
                        if (companyName.contentEquals("Company" + namePostFix) && projectName.contentEquals("Project" + namePostFix)) {
                            LOGGER.info("Schema Added is Found");
                            isNewSchemaAdded = true;
                            break;
                        }
                    }
                }
            }
            else
            {
                isNewSchemaAdded = false;
                LOGGER.info("No Schema on Table is Found");
            }
        }

        return isNewSchemaAdded;
    }

    public int getBadgeCount()
    {
        return Integer.parseInt(driver.findElement(By.xpath(badgeCount)).getText());
    }

    public DropDownMenu clickDropDownMenu()
    {
        clickOnElement(By.xpath(dropDownButton));
        return new DropDownMenu();
    }
}
