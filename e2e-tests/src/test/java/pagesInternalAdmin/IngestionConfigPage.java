package pagesInternalAdmin;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/16/17.
 */

public class IngestionConfigPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectProjectButton = "//label[text()='Work Project']/parent::div/div/descendant::button";
    private String configButton = ".//span[text()='Add Configuration']";
    private String configFormCancelButton = ".//span[text()='Cancel']";
    private String configFormConfirmButton = ".//span[text()='Confirm']";
    private String configNameField = ".//div[text()='Enter Configuration Type']/following-sibling::input";
    private String configTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total Configuration Found']/div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";
    private String editDeleteButton = "span[text()='Action Menu']";
    private String editConfigButton = ".//div[text()='Settings']";
    private String editConfigWatcherEmailField = ".//div[text()='Enter Email']/parent::div/descendant::input";
    private String editConfigWatcherEmailAddButton = ".//span[text()='Add']/parent::div/parent::button";
    private String editConfigStatusButton = ".//td[text()='Active/Diactive']/parent::tr/descendant::input";
    private String editConfigDescriptionField = ".//div[text()='Enter Configuration Description']/parent::div/descendant::textarea[2]";
    private String deleteConfigButton = ".//div[text()='Delete']";

    IngestionConfigPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(configButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddConfigFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(configFormCancelButton));
            LOGGER.info("Config Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Config Form is not displayed");
        }
    }

    public void selectCompany(int namePostFix) throws MalformedURLException
    {
        selectEntity("Company", namePostFix, selectCompanyButton);
    }

    public void selectProject(int namePostFix) throws MalformedURLException
    {
        selectEntity("Project", namePostFix, selectProjectButton);
    }

    public void addNewConfig(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(configButton));
        waitForAddConfigFormToDisplay();
        driver.findElement(By.xpath(configNameField)).sendKeys("Config" + namePostFix);
        clickOnElement(By.xpath(configFormConfirmButton));
        LOGGER.info("Ingestion Config is Added");
        waitForElementToDisappear(By.xpath(configFormCancelButton));
    }

    public boolean verifyConfig(int namePostFix)
    {
        boolean isNewConfigAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(configTable)))
        {
            int totalRowsInConfigTable = driver.findElements(By.xpath(configTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInConfigTable));
            if(totalRowsInConfigTable > 1) {
                String configNameDisplayed;

                for (int i = 2; i < totalRowsInConfigTable + 2; i++) {
                    configNameDisplayed = driver.findElement(By.xpath(configTable + "/descendant::tr[" + i + "]/td[4]")).getText();
                    if (configNameDisplayed.contentEquals("Config" + namePostFix)) {
                        String companyName, projectName;
                        companyName = driver.findElement(By.xpath(configTable + "/descendant::tr[" + i + "]/td[2]")).getText();
                        projectName = driver.findElement(By.xpath(configTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                        LOGGER.info(companyName + " " + projectName);
                        if (companyName.contentEquals("Company" + namePostFix) && projectName.contentEquals("Project" + namePostFix)) {
                            LOGGER.info("Ingestion Configuration is Found");
                            isNewConfigAdded = true;
                            break;
                        }
                    }
                }
            }
            else
            {
                isNewConfigAdded = false;
                LOGGER.info("No Ingestion Config on Table is Found");
            }
        }

        return isNewConfigAdded;
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

    public void openEditConfigPopUp(int namePostFix) throws MalformedURLException
    {
        holdOnForASec();
        clickOnElement(By.xpath(".//td[text()='Company" + namePostFix + "']/parent::tr/descendant::" + editDeleteButton));
        waitForVisible(By.xpath(editConfigButton));
    }

    public void editConfig(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(editConfigButton));
        waitForVisible(By.xpath(configFormConfirmButton));
        driver.findElement(By.xpath(editConfigDescriptionField)).sendKeys("Description" + namePostFix);
        holdOnForASec();
        clickOnElement(By.xpath(editConfigStatusButton));
        for(int i = 1; i < 3; i++)
        {
            driver.findElement(By.xpath(editConfigWatcherEmailField)).sendKeys("watcher" + i + "-" + namePostFix + "@dispatchr.co");
            holdOnForASec();
            clickOnElement(By.xpath(editConfigWatcherEmailAddButton));
            holdOnForASec();
        }
        clickOnElement(By.xpath(".//div[text()='watcher2-" + namePostFix + "@dispatchr.co']/parent::div/button"));
        clickOnElement(By.xpath(configFormConfirmButton ));
        waitForElementToDisappear(By.xpath(configFormConfirmButton));
    }

    private boolean getStatusFromCheckbox()
    {
        boolean isConfigActive = false;
        String configStatus = driver.findElement(By.xpath(editConfigStatusButton)).getAttribute("checked");
        if(configStatus != null)
            isConfigActive = true;
        return isConfigActive;
    }

    public boolean verifyEditConfig(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(editConfigButton));
        waitForVisible(By.xpath(configFormConfirmButton));
        String descriptionDisplayed = driver.findElement(By.xpath(editConfigDescriptionField)).getAttribute("value");
        LOGGER.info(descriptionDisplayed);
        boolean isWatcherPresent = isElementPresent(By.xpath(".//div[text()='watcher1-" + namePostFix + "@dispatchr.co']"));
        boolean isStatusDeactivated = getStatusFromCheckbox();
        holdOnForASec();
        clickOnElement(By.xpath(configFormConfirmButton));
        return descriptionDisplayed.contentEquals("Description" + namePostFix) &&
                isWatcherPresent && !isStatusDeactivated;

    }

    public void deleteConfig() throws MalformedURLException
    {
        clickOnElement(By.xpath(deleteConfigButton));
        waitForVisible(By.xpath(configFormConfirmButton));
        holdOnForASec();
        clickOnElement(By.xpath(configFormConfirmButton));
        waitForElementToDisappear(By.xpath(configFormConfirmButton));
    }
}
