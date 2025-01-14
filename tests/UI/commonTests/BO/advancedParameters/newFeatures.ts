// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import BO pages
import featureFlagPage from '@pages/BO/advancedParameters/featureFlag';
import dashboardPage from '@pages/BO/dashboard';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

let browserContext: BrowserContext;
let page: Page;

/**
 * Indicate the default state of new page with feature flags, depending on its initial value we need to
 * adapt the tests behaviour especially the part that enables/disables the page. We keep this value editable
 * here in case the default value changes the tests will be easy to adapt.
 */
function isNewProductPageEnabledByDefault(): boolean {
  return true;
}

/**
 * Reset the new product page to its initial state.
 *
 * @param baseContext {string}
 */
function resetNewProductPageAsDefault(baseContext: string = 'commonTests-resetNewProductPage'): void {
  setFeatureFlag(featureFlagPage.featureFlagProductPageV2, isNewProductPageEnabledByDefault(), baseContext);
}

function setFeatureFlag(featureFlag: string, expectedStatus: boolean, baseContext: string = 'commonTests-setFeatureFlag'): void {
  let title: string;

  switch (featureFlag) {
    case featureFlagPage.featureFlagAuthorizationServer:
      title = 'Authorization server';
      break;
    case featureFlagPage.featureFlagMultipleImageFormats:
      title = 'Multiple image formats';
      break;
    case featureFlagPage.featureFlagProductPageV2:
      title = 'New product page';
      break;
    default:
      throw new Error(`The feature flag ${featureFlag} is not defined`);
  }

  describe(`${expectedStatus ? 'Enable' : 'Disable'} the feature flag "${title}"`, async () => {
    // before and after functions
    before(async function () {
      browserContext = await helper.createBrowserContext(this.browser);
      page = await helper.newTab(browserContext);
    });

    after(async () => {
      await helper.closeBrowserContext(browserContext);
    });

    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Advanced Parameters > New & Experimental Features\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToFeatureFlagPage', baseContext);

      await dashboardPage.goToSubMenu(
        page,
        dashboardPage.advancedParametersLink,
        dashboardPage.featureFlagLink,
      );
      await featureFlagPage.closeSfToolBar(page);

      const pageTitle = await featureFlagPage.getPageTitle(page);
      expect(pageTitle).to.contains(featureFlagPage.pageTitle);
    });

    it(`should ${expectedStatus ? 'enable' : 'disable'} "${title}"`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'setFeatureFlag', baseContext);

      const successMessage = await featureFlagPage.setFeatureFlag(page, featureFlag, expectedStatus);
      expect(successMessage).to.be.contain(featureFlagPage.successfulUpdateMessage);
    });
  });
}

export {
  isNewProductPageEnabledByDefault,
  resetNewProductPageAsDefault,
  setFeatureFlag,
};
