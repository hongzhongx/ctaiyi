# 白玉京 API

通过访问白玉京 API 的接口，可以获取区块链上的只读数据，无须消耗资源与区块链交互。

## 账户相关

- [`getAccounts`](/guide/client/baiyujing/get-accounts)
- [`lookupAccountNames`](/guide/client/baiyujing/lookup-account-names)
- [`lookupAccounts`](/guide/client/baiyujing/lookup-accounts)
- [`getAccountsCount`](/guide/client/baiyujing/get-accounts-count)
- [`getAccountHistory`](/guide/client/baiyujing/get-account-history)
- [`getAccountResources`](/guide/client/baiyujing/get-account-resources)
- [`getOwnerHistory`](/guide/client/baiyujing/get-owner-history)
- [`getRecoveryRequest`](/guide/client/baiyujing/get-recovery-request)
- [`getWithdrawRoutes`](/guide/client/baiyujing/get-withdraw-routes)
- [`getQiDelegations`](/guide/client/baiyujing/get-qi-delegations)
- [`getExpiringQiDelegations`](/guide/client/baiyujing/get-expiring-qi-delegations)

## 角色

- [`findActor`](/guide/client/baiyujing/find-actor)
- [`findActors`](/guide/client/baiyujing/find-actors)
- [`listActors`](/guide/client/baiyujing/list-actors)
- [`getActorHistory`](/guide/client/baiyujing/get-actor-history)
- [`listActorsBelowHealth`](/guide/client/baiyujing/list-actors-below-health)
- [`findActorTalentRules`](/guide/client/baiyujing/find-actor-talent-rules)
- [`listActorsOnZone`](/guide/client/baiyujing/list-actors-on-zone)

## NFA

- [`findNfa`](/guide/client/baiyujing/find-nfa)
- [`findNfas`](/guide/client/baiyujing/find-nfas)
- [`listNfas`](/guide/client/baiyujing/list-nfas)
- [`getNfaHistory`](/guide/client/baiyujing/get-nfa-history)
- [`getNfaActionInfo`](/guide/client/baiyujing/get-nfa-action-info)
- [`evalNfaAction`](/guide/client/baiyujing/eval-nfa-action)
- [`evalNfaActionWithStringArgs`](/guide/client/baiyujing/eval-nfa-action-with-string-args)

## 交易

- [`getTransactionHex`](/guide/client/baiyujing/get-transaction-hex)
- [`getTransaction`](/guide/client/baiyujing/get-transaction)
- [`getTransactionResults`](/guide/client/baiyujing/get-transaction-results)
- [`getRequiredSignatures`](/guide/client/baiyujing/get-required-signatures)
- [`getPotentialSignatures`](/guide/client/baiyujing/get-potential-signatures)
- [`verifyAuthority`](/guide/client/baiyujing/verify-authority)
- [`verifyAccountAuthority`](/guide/client/baiyujing/verify-account-authority)

## 司命

- [`getSimings`](/guide/client/baiyujing/get-simings)
- [`getSimingByAccount`](/guide/client/baiyujing/get-siming-by-account)
- [`getSimingsByAdore`](/guide/client/baiyujing/get-simings-by-adore)
- [`lookupSimingAccounts`](/guide/client/baiyujing/lookup-siming-accounts)
- [`getSimingCount`](/guide/client/baiyujing/get-siming-count)

## 天道

- [`getTiandaoProperties`](/guide/client/baiyujing/get-tiandao-properties)
- [`findZones`](/guide/client/baiyujing/find-zones)
- [`findZonesByName`](/guide/client/baiyujing/find-zones-by-name)
- [`listZones`](/guide/client/baiyujing/list-zones)
- [`listZonesByType`](/guide/client/baiyujing/list-zones-by-type)
- [`listToZonesByFrom`](/guide/client/baiyujing/list-to-zones-by-from)
- [`listFromZonesByTo`](/guide/client/baiyujing/list-from-zones-by-to)
- [`findWayToZone`](/guide/client/baiyujing/find-way-to-zone)
- [`getContractSourceCode`](/guide/client/baiyujing/get-contract-source-code)
