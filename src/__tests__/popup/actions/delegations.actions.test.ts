import * as delegationsActions from 'src/popup/actions/delegations.actions';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('delegations.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('loadDelegators tests:\n', () => {
    test('Must fetch delegators', async () => {
      HiveUtils.getDelegators = jest
        .fn()
        .mockResolvedValue(delegations.delegators);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegators(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.incoming).toEqual(
        delegations.delegators,
      );
    });
    test('If an errors occurs, must catch the error, set errorMessage and delgations to null', async () => {
      const errorMessageExpected = {
        key: 'popup_html_error_retrieving_incoming_delegations',
        params: [],
        type: 'ERROR',
      };
      const promiseError = new Error('Custom error message');
      HiveUtils.getDelegators = jest.fn().mockRejectedValue(promiseError);
      jest.spyOn(Logger, 'error');
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegators(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.incoming).toEqual(null);
      expect(fakeStore.getState().errorMessage).toEqual(errorMessageExpected);
    });
  });

  describe('loadDelegatees tests:\n', () => {
    test('Must fetch delegatees', async () => {
      HiveUtils.getDelegatees = jest
        .fn()
        .mockResolvedValue(delegations.delegatees);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegatees(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.outgoing).toEqual(
        delegations.delegatees,
      );
    });
    test('If an errors occurs, must catch the error and call Logger.error', async () => {
      const customErrorMessage = 'Custom Error';
      const promiseError = new Error(customErrorMessage);
      HiveUtils.getDelegatees = jest.fn().mockRejectedValueOnce(promiseError);
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegatees(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.outgoing).toEqual([]);
      expect(spyLoggerError).toBeCalledTimes(1);
      expect(spyLoggerError).toBeCalledWith(promiseError);
      spyLoggerError.mockClear();
      spyLoggerError.mockReset();
    });
  });
});
