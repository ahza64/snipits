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
    private String removeAllValuesTaxonomyValueButton = ".//span[text()='Remove all Values']";
    private String addTaxonomyValueFormCancelButton = ".//span[text()='Cancel']";
    private String addTaxonomyValueFormConfirmButton = ".//span[text()='Confirm']";
    private String addTaxonomyFieldName = ".//td[text()='Taxonomy Field Name']/parent::tr/descendant::input";
    private String addTaxonomyFieldValue = ".//td[text()='Taxonomy Field Value']/parent::tr/descendant::input";
    private String taxonomyValueTable = ".//*[@class='row']";
    private String badgeCount = ".//*[text()='Total of all values for the selected schema: \"']/following-sibling::div/div/span";
    private String dropDownButton = ".//*[@class='dropdown']/a";

    TaxonomyValuesPage() throws MalformedURLException
    {
        waitForVisible(By.xpath(removeAllValuesTaxonomyValueButton));
        waitForPageLoadComplete();
        holdOnForACoupleOfSec();
    }

    private void waitForAddTaxonomyValuesFormToDisplay()
    {
        try {
            waitForVisible(By.xpath(addTaxonomyValueFormCancelButton));
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
            clickOnElement(By.xpath(addTaxonomyValueFormConfirmButton));
            LOGGER.info("Taxonomy Values is Added");
        }
        else
        {
            LOGGER.info("Invalid Values of Company/Project/Scheme is shown on Form");
        }
        waitForElementToDisappear(By.xpath(addTaxonomyValueFormCancelButton));
    }

    public boolean verifyNewTaxonomyValueIsAdded(int namePostFix)
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
                            fieldValueDisplayed.contentEquals("FieldValue" + namePostFix))
                    {
                        LOGGER.info("Taxonomy Value Added is Found");
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

    public boolean viewValuesByScheme(int namePostFix)
    {
        clickOnElement(By.xpath(viewByValueSchemaValueButton));
        holdOnForASec();
        boolean isValueDisplayed = verifyNewTaxonomyValueIsAdded(namePostFix);
        if(!isValueDisplayed)
            LOGGER.severe("Value associated with selected Schema is not displayed");

        return isValueDisplayed;
    }

    public boolean viewValuesByTaxonomy(int namePostFix)
    {
        clickOnElement(By.xpath(viewByValueTaxonomyValueButton));
        holdOnForASec();
        boolean isValueDisplayed =verifyNewTaxonomyValueIsAdded(namePostFix);
        if(!isValueDisplayed)
            LOGGER.severe("Value associated with selected Taxonomy is not displayed");

        return isValueDisplayed;
    }
}
