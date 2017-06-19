package pagesInternalAdmin;

import org.openqa.selenium.By;

import java.net.MalformedURLException;
import java.util.Random;

import setup.WebAppPage;

import static constants.Constants.*;

/**
 * Created by az on 5/17/17.
 */

public class SchemaPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectProjectButton = "//label[text()='Project']/parent::div/div/descendant::button";
    private String selectSchemaButton = "//label[text()='Select a Schema']/parent::div/div/descendant::button";
    private String addSchemaButton = ".//span[text()='Add Schema']";
    private String addSchemaFormCancelButton = ".//span[text()='Cancel']";
    private String addSchemaFormConfirmButton = ".//span[text()='Create Schema']";
    private String addSchemaNameField = ".//div[text()='Schema Name']/following-sibling::input";
    private String schemaTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total Project Schemas Found']/div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";
    private String editSchemaButton = ".//span[text()='Edit Schema']";
    private String deleteSchemaButton = ".//span[text()='Delete Schema']";
    private String saveSchemaButton = ".//span[text()='Save']";
    private String cancelSchemaButton = ".//span[text()='Cancel']";
    private String editAddFieldSchemaButton = ".//span[text()='Add Field']";
    private String editDeleteFieldSchemaButton = ".//span[text()='delete']";
    private String editAddFieldNameSchemaField = ".//div[text()='Enter a Field Name']/following-sibling::input";
    private String editAddDataTypeSchemaButton = ".//label[text()='Data Type']/parent::div/descendant::button";
    private String editAddDataTypeSchemaDropDown = ".//div[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 768px;']";
    private String editCreateSchemaButton = ".//span[text()='Create']";
    private String moduleTable = ".//h3[text()='Schema Editor']/parent::div/descendant::div[@style='height: inherit; overflow-x: hidden; overflow-y: auto;']/table";

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
        selectEntity(COMPANY_NAME, namePostFix, selectCompanyButton);
    }

    public void selectProject(int namePostFix) throws MalformedURLException
    {
        selectEntity(PROJECT_NAME, namePostFix, selectProjectButton);
    }

    public void selectSchema(int namePostFix) throws MalformedURLException
    {
        selectEntity(SCHEMA_NAME, namePostFix, selectSchemaButton);
    }

    public void addNewSchema(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addSchemaButton));
        waitForAddSchemaFormToDisplay();
        driver.findElement(By.xpath(addSchemaNameField)).sendKeys(SCHEMA_NAME + namePostFix);
        clickOnElement(By.xpath(addSchemaFormConfirmButton));
        LOGGER.info("Schema is Added");
        waitForElementToDisappear(By.xpath(addSchemaFormCancelButton));
    }

    public boolean verifySchema(int namePostFix) throws MalformedURLException
    {
        boolean isSchemaVerified = false;
        String schemaSelected = driver.findElement(By.xpath("//label[text()='Select a Schema']/parent::div/div/descendant::button/parent::div/div[2]")).getText();

        if(!schemaSelected.isEmpty())
        {
            if(isElementPresentAndDisplayedByLocator(By.xpath(selectSchemaButton)))
            {
                clickOnElement(By.xpath(selectSchemaButton));
                holdOnForASec();
                if(isElementPresentAndDisplayedByLocator(By.xpath(".//div[text()='" + SCHEMA_NAME + namePostFix + "']/parent::div/parent::div/parent::span")))
                {
                    if(isElementPresent(By.xpath(".//div[text()='" + SCHEMA_NAME + namePostFix + "']/parent::div/parent::div/parent::span")))
                    {
                        clickOnElement(By.xpath(".//div[text()='" + SCHEMA_NAME + namePostFix + "']/parent::div/parent::div/parent::span"));
                        isSchemaVerified = true;
                        LOGGER.info("Schema is Verified");
                        holdOnForACoupleOfSec();
                    }
                }
            }
        }

        return isSchemaVerified;
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

    public void openEditSchemaPopUp() throws MalformedURLException
    {
        clickOnElement(By.xpath(editSchemaButton));
        waitForVisible(By.xpath(saveSchemaButton));
    }

    public String editSchema(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(editAddFieldSchemaButton));
        waitForVisible(By.xpath(cancelSchemaButton));
        driver.findElement(By.xpath(editAddFieldNameSchemaField)).clear();
        driver.findElement(By.xpath(editAddFieldNameSchemaField)).sendKeys(SCHEMA_FIELD_NAME + namePostFix);
        clickOnElement(By.xpath(editAddDataTypeSchemaButton));
        waitForVisible(By.xpath(editAddDataTypeSchemaDropDown));
        Random rand = new Random();
        int dataTypeToSelect = rand.nextInt(8) + 1;
        String dataTypeSelect = driver.findElement(By.xpath(editAddDataTypeSchemaDropDown + "/div[" + dataTypeToSelect + "]")).getText();
        clickOnElement(By.xpath(editAddDataTypeSchemaDropDown + "/div[" + dataTypeToSelect + "]"));
        holdOnForASec();
        clickOnElement(By.xpath(editCreateSchemaButton));
        waitForElementToDisappear(By.xpath(editCreateSchemaButton));
        return dataTypeSelect;
    }

    public boolean verifyFieldModuleTable(int namePostFix, String dataTypeSelect) throws MalformedURLException
    {
        boolean isSchemaVerified = false;

        holdOnForACoupleOfSec();
        if(isElementPresent(By.xpath(moduleTable)))
        {
            int totalFields = driver.findElements(By.xpath(moduleTable + "/descendant::tr")).size();
             for(int i = 1; i <= totalFields; i++)
            {
                String fieldNameDisplayed, dataTypeDisplayed;
                fieldNameDisplayed = driver.findElement(By.xpath(moduleTable + "/descendant::tr[" + i + "]/td[2]")).getText();
                dataTypeDisplayed = driver.findElement(By.xpath(moduleTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                if(fieldNameDisplayed.contentEquals(SCHEMA_FIELD_NAME + namePostFix) &&
                        dataTypeDisplayed.contentEquals(dataTypeSelect))
                {
                    isSchemaVerified = true;
                    LOGGER.info("Field is found on Module Table");
                    break;
                }
            }
        }

        return isSchemaVerified;
    }

    public void clickSaveButton()
    {
        clickOnElement(By.xpath(saveSchemaButton));
    }

    public boolean verifyFieldSchemaTable(int namePostFix, String dataTypeSelect) throws MalformedURLException
    {
        boolean isSchemaVerified = false;

        holdOnForACoupleOfSec();
        if(isElementPresent(By.xpath(schemaTable)))
        {
            int totalFields = driver.findElements(By.xpath(schemaTable + "/descendant::tr")).size();

            if(totalFields > 1)
            {
                for (int i = 2; i < totalFields + 2; i++) {
                    String fieldNameDisplayed, dataTypeDisplayed;
                    fieldNameDisplayed = driver.findElement(By.xpath(schemaTable + "/descendant::tr[" + i + "]/td[2]")).getText();
                    dataTypeDisplayed = driver.findElement(By.xpath(schemaTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                    if (fieldNameDisplayed.contentEquals(SCHEMA_FIELD_NAME + namePostFix) &&
                            dataTypeDisplayed.contentEquals(dataTypeSelect)) {
                        isSchemaVerified = true;
                        LOGGER.info("Field is found on Schema Table");
                        break;
                    }
                }
            }
            else
            {
                LOGGER.info("No Schemas on Table is Found");
            }
        }

        return isSchemaVerified;
    }

    public boolean deleteSchemaField(int namePostFix, String dataTypeSelect) throws MalformedURLException
    {
        boolean isFieldDeleted = false;
        if (isElementPresent(By.xpath(moduleTable))) {
            int totalFields = driver.findElements(By.xpath(moduleTable + "/descendant::tr")).size();

            for (int i = 1; i <= totalFields; i++) {
                String fieldNameDisplayed, dataTypeDisplayed;
                fieldNameDisplayed = driver.findElement(By.xpath(moduleTable + "/descendant::tr[" + i + "]/td[2]")).getText();
                dataTypeDisplayed = driver.findElement(By.xpath(moduleTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                if (fieldNameDisplayed.contentEquals(SCHEMA_FIELD_NAME + namePostFix) &&
                        dataTypeDisplayed.contentEquals(dataTypeSelect)) {
                    isFieldDeleted = true;
                    clickOnElement(By.xpath(moduleTable + "/descendant::tr[1]/descendant::button"));
                    LOGGER.info("Field is deleted on Module Table");
                    break;
                }
            }
        }

        return isFieldDeleted;
    }

    public void deleteSchema() throws MalformedURLException
    {
        if(isElementPresent(By.xpath(deleteSchemaButton)))
        {
            clickOnElement(By.xpath(deleteSchemaButton));
        }
        waitForElementToDisappear(By.xpath(deleteSchemaButton));
    }
}
