import { getRequestHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import HiveUtils from 'src/utils/hive.utils';

export const broadcastTransfer = async (data: RequestTransfer & RequestId) => {
  let result,
    err,
    err_message = null;
  try {
    const { username, to } = data;
    const client = getRequestHandler().getHiveClient();
    const memoKey: string = getRequestHandler().getUserKey(
      username!,
      KeychainKeyTypesLC.memo,
    )[0];
    const key = getRequestHandler().key;
    let memo = data.memo || '';
    if (data.memo && data.memo.length > 0 && data.memo[0] == '#') {
      const receiver = (await client.database.getAccounts([to]))[0];

      if (!receiver) {
        throw new Error('Could not encode memo.');
      }
      const memoReceiver = receiver.memo_key;
      memo = HiveUtils.encodeMemo(memoKey, memoReceiver, memo);
    }

    result = await client.broadcast.transfer(
      {
        from: data.username!,
        to: data.to,
        amount: data.amount + ' ' + data.currency,
        memo,
      },
      PrivateKey.from(key!),
    );
  } catch (e) {
    console.log(e);
    if (typeof e === 'string') {
      const message = createMessage(
        true,
        null,
        data,
        null,
        'Could not encode memo.',
      );
      return message;
    } else {
      err = e;
      if (!(err as any)?.data?.stack[0]?.context?.method)
        err_message = chrome.i18n.getMessage('bgd_ops_error_broadcasting');
      else {
        switch ((err as any).data.stack[0].context.method) {
          case 'adjust_balance':
            err_message = chrome.i18n.getMessage(
              'bgd_ops_transfer_adjust_balance',
              [data.currency, data.username],
            );
            break;
          case 'get_account':
            err_message = chrome.i18n.getMessage(
              'bgd_ops_transfer_get_account',
              [data.to],
            );
            break;
          default:
            err_message = chrome.i18n.getMessage('bgd_ops_error_broadcasting');
            break;
        }
      }
    }
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_transfer_success', [
        data.amount,
        data.currency,
        data.username,
        data.to,
      ]),
      err_message,
    );
    return message;
  }
};