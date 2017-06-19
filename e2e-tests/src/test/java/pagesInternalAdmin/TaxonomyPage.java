package pagesInternalAdmin;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

import static constants.Constants.*;

/**
 * Created by az on 5/18/17.
 */

public class TaxonomyPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectProjectButton = "//label[text()='Work Project']/parent::div/div/descendant::button";
    private String selectSchemaButton = "//label[text()='Project Schemas']/parent::div/div/descendant::button";
    private String addTaxonomyButton = ".//span[text()='Add Taxonomy']";
    private String addTaxonomyFormCancelButton = ".//span[text()='Cancel']";
    private String addTaxonomyFormConfirmButton = ".//span[text()='Confirm']";
    private String addTaxonomyCompanyField = ".//td[text()='Company']/parent::tr/descendant::input";
    private String addTaxonomyProjectField = ".//td[text()='Work Project']/parent::tr/descendant::input";
    private String addTaxonomySchemaField = ".//td[text()='Schema Name']/parent::tr/descendant::input";
    private String addTaxonomyFieldNameField = ".//td[text()='Field Name']/parent::tr/descendant::input";
    private String addTaxonomyNodeField = ".//td[text()='Node Type']/parent::tr/descendant::input";
    private String addTaxonomyKeysField = ".//td[text()='Keys']/parent::tr/descendant::input";
    private String taxonomyTable = ".//*[@class='row']";
    private String saveChangesButton = ".//span[text()='Save Changes']";
    private String saveChangesPopupButton = ".//h3[text()='ALERT!!!']/parent::div/descendant::span[text()='Save Changes']";
    private String badgeCount = ".//*[text()='Total Taxonomy Definitions Found']/following-sibling::div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";
    private String editDeleteButton = ".//span[text()='Edit/Delete'][1]";
    private String editTaxonomyButton = ".//div[text()='Edit Taxonomy']";
    private String deleteTaxonomyButton = ".//div[text()='Delete Taxonomy']";

    TaxonomyPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(addTaxonomyButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddTaxonomyFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addTaxonomyFormCancelButton));
            LOGGER.info("Add Taxonomy Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Taxonomy Form is not displayed");
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

    private boolean verifyValuesOnForm(int namePostFix)
    {
        boolean isValueValid = false;
        String companyFieldText = driver.findElement(By.xpath(addTaxonomyCompanyField)).getAttribute("value");
        String projectFieldText = driver.findElement(By.xpath(addTaxonomyProjectField)).getAttribute("value");
        String schemaFieldText = driver.findElement(By.xpath(addTaxonomySchemaField)).getAttribute("value");

        if(companyFieldText.contentEquals(COMPANY_NAME + namePostFix) &&
                projectFieldText.contentEquals(PROJECT_NAME + namePostFix) &&
                schemaFieldText.contentEquals(SCHEMA_NAME + namePostFix))
        {
            isValueValid = true;
        }

        return isValueValid;
    }

    public void addNewTaxonomy(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addTaxonomyButton));
        waitForAddTaxonomyFormToDisplay();

        if(verifyValuesOnForm(namePostFix)) {
            driver.findElement(By.xpath(addTaxonomyFieldNameField)).sendKeys(TAXONOMY_NAME + namePostFix);
            driver.findElement(By.xpath(addTaxonomyNodeField)).sendKeys(TAXONOMY_NODE + namePostFix);
            driver.findElement(By.xpath(addTaxonomyKeysField)).sendKeys(TAXONOMY_KEYS + namePostFix);
            clickOnElement(By.xpath(addTaxonomyFormConfirmButton));
            LOGGER.info("Taxonomy is Added");
        }
        else
        {
            LOGGER.info("Invalid Values of Company/Project/Scheme is shown on Form");
        }
        waitForElementToDisappear(By.xpath(addTaxonomyFormCancelButton));
    }

    // if addOrSave == true then its verifying add feature
    // if addOrSave == false then its verifying save feature
    public boolean verifyTaxonomy(boolean addOrSave, int namePostFix)
    {
        boolean isNewTaxonomyAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyTable)))
        {
            int totalRowsInSchemaTable = driver.findElements(By.xpath(taxonomyTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInSchemaTable));
            if(totalRowsInSchemaTable > 1)
            {
                String fieldNameDisplayed, nodeTypeDisplayed, keysDisplayed;
                for (int i = 2; i < totalRowsInSchemaTable + 2; i++)
                {
                    fieldNameDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[3]")).getText();
                    nodeTypeDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[6]")).getText();
                    keysDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[7]")).getText();

                    if (fieldNameDisplayed.contentEquals(TAXONOMY_NAME + namePostFix) &&
                            nodeTypeDisplayed.contentEquals(TAXONOMY_NODE + namePostFix) &&
                            keysDisplayed.contentEquals(TAXONOMY_KEYS + namePostFix))
                    {
                        String savedToDataBaseDisplayed;
                        savedToDataBaseDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[" + i + "]/td[2]")).getText();

                        if (addOrSave && savedToDataBaseDisplayed.contentEquals("No!!")) {
                            LOGGER.info("Taxonomy Added is Found");
                            isNewTaxonomyAdded = true;
                            break;
                        }
                        else if (!addOrSave && savedToDataBaseDisplayed.contentEquals("Yes")) {
                            LOGGER.info("Taxonomy Added is Saved");
                            isNewTaxonomyAdded = true;
                            break;
                        }
                    }
                }
            }
            else
            {
                LOGGER.info("No Taxonomy on Table is Found");
            }
        }

        return isNewTaxonomyAdded;
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

    public void clickSaveChanges() throws MalformedURLException
    {
        clickOnElement(By.xpath(saveChangesButton));
        holdOnForACoupleOfSec();
        waitForVisible(By.xpath(saveChangesPopupButton));
        clickOnElement(By.xpath(saveChangesPopupButton));
        holdOnForACoupleOfSec();
    }

    public void editTaxonomyFieldName(int namePostFix) throws MalformedURLException
    {
        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyTable)))
        {
            clickOnElement(By.xpath(editDeleteButton));
            waitForVisible(By.xpath(editTaxonomyButton));
            clickOnElement(By.xpath(editTaxonomyButton));
            waitForAddTaxonomyFormToDisplay();
            driver.findElement(By.xpath(addTaxonomyFieldNameField)).clear();
            driver.findElement(By.xpath(addTaxonomyFieldNameField)).sendKeys(TAXONOMY_NAME + namePostFix);
            driver.findElement(By.xpath(addTaxonomyNodeField)).clear();
            driver.findElement(By.xpath(addTaxonomyNodeField)).sendKeys(TAXONOMY_NODE + namePostFix);
            driver.findElement(By.xpath(addTaxonomyKeysField)).clear();
            driver.findElement(By.xpath(addTaxonomyKeysField)).sendKeys(TAXONOMY_KEYS + namePostFix);
            holdOnForASec();
            clickOnElement(By.xpath(addTaxonomyFormConfirmButton));
            waitForElementToDisappear(By.xpath(addTaxonomyFormCancelButton));
            LOGGER.info("Taxonomy Values is Edited");
        }
    }

    public String deleteTaxonomyFieldName() throws MalformedURLException
    {
        String fieldValueDisplayed = null;
        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyTable)))
        {
            fieldValueDisplayed = driver.findElement(By.xpath(taxonomyTable + "/descendant::tr[2]/td[2]")).getText();
            clickOnElement(By.xpath(editDeleteButton));
            waitForVisible(By.xpath(deleteTaxonomyButton));
            clickOnElement(By.xpath(deleteTaxonomyButton));
            waitForAddTaxonomyFormToDisplay();
            holdOnForASec();
            clickOnElement(By.xpath(addTaxonomyFormConfirmButton));
            waitForElementToDisappear(By.xpath(addTaxonomyFormCancelButton));
            LOGGER.info("Taxonomy Field Name is Deleted");
        }
        return fieldValueDisplayed;
    }
}
