import { historyHiveEngineAPI, hsc } from '@api/hiveEngine';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/actions/interfaces';
import {
  OperationsHiveEngine,
  Token,
  TokenBalance,
  TokenMarket,
  TokenTransaction,
} from 'src/interfaces/tokens.interface';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import Logger from 'src/utils/logger.utils';

export const loadTokens = (): AppThunk => async (dispatch) => {
  const action: ActionPayload<Token[]> = {
    type: ActionType.LOAD_TOKENS,
    payload: (await hsc.find('tokens', 'tokens', {}, 1000, 0, [])).map(
      (t: any) => {
        return {
          ...t,
          metadata: JSON.parse(t.metadata),
        };
      },
    ),
  };
  dispatch(action);
};

export const loadTokensMarket = (): AppThunk => async (dispatch) => {
  const action: ActionPayload<TokenMarket[]> = {
    type: ActionType.LOAD_TOKENS_MARKET,
    payload: await hsc.find('market', 'metrics', {}, 1000, 0, []),
  };
  dispatch(action);
};

export const loadUserTokens =
  (account: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch({
        type: ActionType.CLEAR_USER_TOKENS,
      });
      let tokensBalance: TokenBalance[] = await HiveEngineUtils.getUserBalance(
        account,
      );
      tokensBalance = tokensBalance
        .filter((t) => parseFloat(t.balance) !== 0)
        .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
      const action: ActionPayload<TokenBalance[]> = {
        type: ActionType.LOAD_USER_TOKENS,
        payload: tokensBalance,
      };
      dispatch(action);
    } catch (e) {
      Logger.error(e);
    }
  };

export const loadTokenHistory =
  (account: string, currency: string): AppThunk =>
  async (dispatch) => {
    let tokenHistory: TokenTransaction[] = [];

    let start = 0;
    let previousTokenHistoryLength = 0;

    do {
      previousTokenHistoryLength = tokenHistory.length;
      let result: TokenTransaction[] = (
        await historyHiveEngineAPI.get('accountHistory', {
          params: {
            account,
            symbol: currency,
            type: 'user',
            offset: start,
          },
        })
      ).data;
      start += 1000;
      tokenHistory = [...tokenHistory, ...result];
    } while (previousTokenHistoryLength !== tokenHistory.length);

    //------- this is for debug -----//
    // let tokenOperationTypes = tokenHistory.map((e: any) => e.operation);
    // tokenOperationTypes = [...new Set(tokenOperationTypes)];
    // console.log(tokenOperationTypes);

    // for (const type of tokenOperationTypes) {
    //   console.log(tokenHistory.find((e: any) => e.operation === type));
    // }
    //-------------------------------//

    tokenHistory = tokenHistory.map((t: any) => {
      t.amount = `${t.quantity} ${t.symbol}`;
      switch (t.operation) {
        case OperationsHiveEngine.CURATION_REWARD:
          return {
            ...(t as TokenTransaction),
            authorPerm: t.authorperm,
          };
        case OperationsHiveEngine.MINING_LOTTERY:
          return { ...(t as TokenTransaction), poolId: t.poolId };
        case OperationsHiveEngine.TOKENS_TRANSFER:
          return {
            ...(t as TokenTransaction),
            from: t.from,
            to: t.to,
            memo: t.memo,
          };
        case OperationsHiveEngine.TOKEN_STAKE:
          return {
            ...(t as TokenTransaction),
            from: t.from,
            to: t.to,
          };
        case OperationsHiveEngine.TOKENS_DELEGATE:
          return {
            ...(t as TokenTransaction),
            delegator: t.from,
            delegatee: t.to,
          };
        case OperationsHiveEngine.TOKEN_UNDELEGATE_START:
        case OperationsHiveEngine.TOKEN_UNDELEGATE_DONE:
          return {
            ...(t as TokenTransaction),
            delegator: t.to,
            delegatee: t.from,
          };
        default:
          return t as TokenTransaction;
      }
    });

    const action: ActionPayload<TokenTransaction[]> = {
      type: ActionType.LOAD_TOKEN_HISTORY,
      payload: tokenHistory,
    };
    dispatch(action);
  };
