import { getRequestHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import {
  AuthorityType,
  CreateClaimedAccountOperation,
  PrivateKey,
} from '@hiveio/dhive';
import {
  RequestCreateClaimedAccount,
  RequestId,
} from '@interfaces/keychain.interface';

export const broadcastCreateClaimedAccount = async (
  data: RequestCreateClaimedAccount & RequestId,
) => {
  let err, result;
  const client = getRequestHandler().getHiveClient();
  let key = getRequestHandler().key;
  try {
    result = await client.broadcast.sendOperations(
      [
        [
          'create_claimed_account',
          {
            creator: data.username,
            new_account_name: data.new_account,
            owner: JSON.parse(data.owner) as AuthorityType,
            active: JSON.parse(data.active) as AuthorityType,
            posting: JSON.parse(data.posting) as AuthorityType,
            memo_key: data.memo,
            extensions: [],
            json_metadata: '{}',
          },
        ] as CreateClaimedAccountOperation,
      ],
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_create_account', [data.new_account]),
      err_message,
    );
    return message;
  }
};