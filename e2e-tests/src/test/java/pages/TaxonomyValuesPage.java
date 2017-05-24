package pages;

import org.openqa.selenium.By;

import java.net.MalformedURLException;

import setup.WebAppPage;

/**
 * Created by az on 5/18/17.
 */

public class TaxonomyValuesPage extends WebAppPage {

    private String selectCompanyButton = ".//label[text()='Company']/parent::div/div/descendant::button";
    private String selectProjectButton = "//label[text()='Work Project']/parent::div/div/descendant::button";
    private String selectSchemaButton = "//label[text()='Project Schemas']/parent::div/div/descendant::button";
    private String selectTaxonomyButton = "//label[text()='Taxonomy Field Name']/parent::div/div/descendant::button";
    private String selectCompanyDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String selectProjectDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String selectSchemaDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String selectTaxonomyDropDown = ".//*[@style='padding: 16px 0px; display: table-cell; user-select: none; width: 256px;']";
    private String addTaxonomyValueRootButton = ".//span[text()='Add Root Value']";
    private String addTaxonomyValueChildButton = ".//span[text()='Add Child Value]";
    private String viewByValueTaxonomyValueButton = ".//span[text()='View values by Taxonomy']";
    private String viewByValueSchemaValueButton = ".//span[text()='View values by Schema']";
    private String removeAllValuesButton = ".//span[text()='Remove all Values']";
    private String taxonomyValueFormCancelButton = ".//span[text()='Cancel']";
    private String taxonomyValueFormConfirmButton = ".//span[text()='Confirm']";
    private String addTaxonomyFieldName = ".//td[text()='Taxonomy Field Name']/parent::tr/descendant::input";
    private String addTaxonomyFieldValue = ".//td[text()='Taxonomy Field Value']/parent::tr/descendant::input";
    private String taxonomyValueTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total of all values for the selected schema: \"']/following-sibling::div/div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";
    private String editDeleteButton = ".//span[text()='Edit/Delete'][1]";
    private String editTaxonomyButton = ".//div[text()='Edit Taxonomy Value']";
    private String deleteTaxonomyButton = ".//div[text()='Delete Taxonomy Value']";

    TaxonomyValuesPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(removeAllValuesButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddTaxonomyValuesFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(taxonomyValueFormConfirmButton));
            LOGGER.info("Add Taxonomy Values Form is displayed");
        } catch (MalformedURLException e) {
            LOGGER.info("Add Taxonomy Values Form is not displayed");
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

    public void selectSchema(int namePostFix) throws MalformedURLException
    {
        selectEntity("Schema", namePostFix, selectSchemaButton, selectSchemaDropDown);
    }

    public void selectTaxonomy(int namePostFix) throws MalformedURLException
    {
        selectEntity("Taxonomy", namePostFix, selectTaxonomyButton, selectTaxonomyDropDown);
    }

    private boolean verifyValuesOnForm(int namePostFix)
    {
        boolean isValueValid = false;
        String companyFieldText = driver.findElement(By.xpath(addTaxonomyFieldName)).getAttribute("value");

        if(companyFieldText.contentEquals("Taxonomy" + namePostFix) )
        {
            isValueValid = true;
        }

        return isValueValid;
    }

    public void addNewTaxonomyValues(int namePostFix) throws MalformedURLException
    {
        clickOnElement(By.xpath(addTaxonomyValueRootButton));
        waitForAddTaxonomyValuesFormToDisplay();

        if(verifyValuesOnForm(namePostFix)) {
            driver.findElement(By.xpath(addTaxonomyFieldValue)).sendKeys("FieldValue" + namePostFix);
            clickOnElement(By.xpath(taxonomyValueFormConfirmButton));
            LOGGER.info("Taxonomy Values is Added");
        }
        else
        {
            LOGGER.info("Invalid Values of Company/Project/Scheme is shown on Form");
        }
        waitForElementToDisappear(By.xpath(taxonomyValueFormCancelButton));
    }

    public boolean verifyTaxonomyValueInTable(int namePostFix, int editNamePostFix)
    {
        boolean isNewTaxonomyValueAdded = false;

        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyValueTable)))
        {
            int totalRowsInSchemaTable = driver.findElements(By.xpath(taxonomyValueTable + "/descendant::tr")).size();
            LOGGER.info(String.valueOf(totalRowsInSchemaTable));
            if(totalRowsInSchemaTable > 1)
            {
                String fieldNameDisplayed, fieldValueDisplayed;
                for (int i = 2; i < totalRowsInSchemaTable + 2; i++)
                {
                    fieldValueDisplayed = driver.findElement(By.xpath(taxonomyValueTable + "/descendant::tr[" + i + "]/td[2]")).getText();
                    fieldNameDisplayed = driver.findElement(By.xpath(taxonomyValueTable + "/descendant::tr[" + i + "]/td[3]")).getText();

                    if (fieldNameDisplayed.contentEquals("Taxonomy" + namePostFix) &&
                            fieldValueDisplayed.contentEquals("FieldValue" + editNamePostFix))
                    {
                        isNewTaxonomyValueAdded = true;
                        break;
                    }
                }
            }
            else
            {
                LOGGER.info("No Taxonomy Value on Table is Found");
            }
        }

        return isNewTaxonomyValueAdded;
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

    public void viewValuesByScheme() throws MalformedURLException
    {
        if(isElementPresent(By.xpath(viewByValueSchemaValueButton)))
        {
            clickOnElement(By.xpath(viewByValueSchemaValueButton));
            holdOnForASec();
        }
    }

    public void viewValuesByTaxonomy() throws MalformedURLException
    {
        if (isElementPresent(By.xpath(viewByValueTaxonomyValueButton)))
        {
            clickOnElement(By.xpath(viewByValueTaxonomyValueButton));
            holdOnForASec();
        }
    }

    public void editTaxonomyValue(int editNamePostFix) throws MalformedURLException
    {
        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyValueTable)))
        {
            clickOnElement(By.xpath(editDeleteButton));
            waitForVisible(By.xpath(editTaxonomyButton));
            clickOnElement(By.xpath(editTaxonomyButton));
            waitForAddTaxonomyValuesFormToDisplay();
            driver.findElement(By.xpath(addTaxonomyFieldValue)).clear();
            driver.findElement(By.xpath(addTaxonomyFieldValue)).sendKeys("FieldValue" + editNamePostFix);
            holdOnForASec();
            clickOnElement(By.xpath(taxonomyValueFormConfirmButton));
            waitForElementToDisappear(By.xpath(taxonomyValueFormCancelButton));
            LOGGER.info("Taxonomy Values is Edited");
        }
    }

    public void removeAllValuesBySchema() throws MalformedURLException
    {
        clickOnElement(By.xpath(removeAllValuesButton));
        holdOnForACoupleOfSec();
        waitForVisible(By.xpath(taxonomyValueFormConfirmButton));
        clickOnElement(By.xpath(taxonomyValueFormConfirmButton));
        waitForElementToDisappear(By.xpath(taxonomyValueFormConfirmButton));
        LOGGER.info("Removed all Taxonomy Values");
    }

    public String deleteTaxonomyValue() throws MalformedURLException
    {
        String fieldValueDisplayed = null;
        if(isElementPresentAndDisplayedByLocator(By.xpath(taxonomyValueTable)))
        {
            fieldValueDisplayed = driver.findElement(By.xpath(taxonomyValueTable + "/descendant::tr[2]/td[2]")).getText();
            clickOnElement(By.xpath(editDeleteButton));
            waitForVisible(By.xpath(deleteTaxonomyButton));
            clickOnElement(By.xpath(deleteTaxonomyButton));
            waitForAddTaxonomyValuesFormToDisplay();
            holdOnForASec();
            clickOnElement(By.xpath(taxonomyValueFormConfirmButton));
            waitForElementToDisappear(By.xpath(taxonomyValueFormCancelButton));
            LOGGER.info("Taxonomy Values is Deleted");
        }
        return fieldValueDisplayed;
    }
}
