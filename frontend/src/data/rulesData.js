export const RULES_DATA = [
  {
    name: 'Football',
    games: [
      {
        title: 'bookmaker',
        rules: [
          { text: 'If the match will not take place within 48 hours of the original kick-off time bets will be void.', danger: false },
          { text: 'If the selection is in a multiple bet or accumulator any refund must be requested before kick-off of the first leg of the multiple bet.', danger: true },
          { text: 'Where a confirmed postponed match features as part of a multiple bet, the bet will stand on the remaining selections in the multiple.', danger: true },
          { text: 'Please note that games which have their kick-off altered well in advance to accommodate live TV, or to ease fixture congestion will not be classed as postponed.', danger: false },
          { text: 'If a match is forfeited or a team is given a walkover victory without the match having kicked off, then all bets will be void. Any subsequently awarded scoreline will not count for settlement purposes.', danger: true },
        ],
      },
      {
        title: 'fancy',
        rules: [
          { text: 'Tournament Total Goals, Team Total Goals goals. scored in 90 minutes or in extra-time will count.Goals scored in penalty shootouts do not count.', danger: true },
          { text: 'Tournament Corners - Only corners taken in 90 minutes count.', danger: true },
          { text: 'Tournament Penalties Missed/Converted - Penalties taken in 90 minutes, extra-time and penalty shootouts all count. If a penalty has to be re-taken the previous disallowed penalty(ies) do not count.', danger: true },
        ],
      },
      {
        title: 'match',
        rules: [
          { text: 'Match Odds :-  \nAll bets apply to the relevant full \'regular time\' period including stoppage time. Any extra-time\nand/or penalty shoot-out is not included.\nFor the cancellation of a goal, due to VAR, bets matched between the time of the goal being\nscored and the time at which the video assistant referee finishes the review will be voided.\nFor the cancellation of a red card, due to VAR, bets matched after the time at which the video\nassistant referee commences the review will be voided.', danger: false },
          { text: 'Under_Over Goals :-  \nIn the event of a match starting but not being completed, all bets will be void, unless the\nspecific market outcome is already determined,', danger: false },
          { text: '1st Period Winner :- \nBets will be void if the match is abandoned before half-time.', danger: false },
          { text: 'Next Goal :- \nOwn goals count to the side credited with the goal.', danger: false },
          { text: 'Draw No Bet :- \nPredict which team will be the winner. In case of a draw, all bets will be void. If a game is\nabandoned, bets will be void.', danger: false },
          { text: 'Both Teams to Score :-  \nPredict whether both teams will score at least one goal in the game. Own goals count towards\nthe team credited with the goal. If a game is abandoned, bets will be void, unless the outcome\nof these bets is already determined.\nYes" – meaning that both teams will score.\n"No" – meaning that either team will not score.', danger: false },
          { text: 'Total Corners :- \nPredict which team will take the named corner in the game. If this specific corner is not taken in\nthe game, bets will be void. For example, game finishes or is abandoned with 8 corners taken –\nall bets on any corner after the 8th will be void (9th, 10th, etc.).', danger: false },
          { text: 'Goals Odd/Even :-  \nAny match resulting in 0-0 will be settled on an even number of goals. For Team Odd/Even\nmarkets, if the specified team does not score then we will settle on an even number of goals. In\nthe event of an abandoned match then bets for that match will be void.', danger: false },
          { text: '1X2 Corners :-  \nPredict which team will get more corners in a match. Awarded, but not taken corners (there is a\ncorner, but before it is taken the referee signals for the end of the first half or the match) will\nnot count for settlement purposes. Also if a corner needs to be re-taken for any reason, it will\nbe counted as 1 corner.', danger: false },
          { text: 'Under/Over Card in Match (Number of cards) :-  \nPredict the number of the cards which will be shown in a match. If a player is sent off for 2\nyellow cards, this counts as 2 yellow cards and 1 red card for betting purpose es. If the match is\nabandoned for any reason, all bets will be void unless market is already determined, e.g. Team\n1 over 2,5 yellow cards - 3 yellow cards awarded to Team 1 before abandonment is settled as a\nwinner. Cards for non-players (already substituted players, managers, players on bench which\nare not substituted in) are not considered.\nSettlement will be made with reference to all available evidence to cards shown during the\nscheduled 90 minutes play. Any card shown after the full-time whistle blow will be disregarded.', danger: false },
          { text: 'First Half Under/Over Goals :- How many goals will be scored in this first half of this match? \nAll bets apply to Full Time according to the match officials, plus any stoppage time. Extra-time/penalty shoot-outs are not included.', danger: false },
          { text: 'Penalty Taken? :- Will a penalty be awarded and taken during this match?\nAll bets apply to Full Time according to the match officials, plus any stoppage time. Extra-time/penalty shoot-outs are not included.', danger: false },
          { text: 'Correct Score :- Predict the score of this match.\nThis market will not be partially settled during the fixture and will be fully settled at full time.\nAll bets apply to Full Time according to the match officials, plus any stoppage time. Extra-time/penalty shoot-outs are not included.', danger: false },
          { text: 'Corners Number/Odds : - How many corners will be taken in the match? Only corners that are taken will be counted.\nAll bets apply to Full Time according to the match officials, plus any stoppage time. Extra-time/penalty shoot-outs are not included.', danger: false },
          { text: 'Team_A/B +1/2/3 : - Who will win this match with the stated handicap applied? \nAll bets apply to Full Time according to the match officials, plus any stoppage time. Extra-time/penalty shoot-outs are\u00a0not\u00a0included.', danger: false },
          { text: 'HT/FT :-  \nBets will be void if the match is abandoned. Extra-time and penalty shootouts do not count.', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
          { text: '"In the event of a technical error or any unforeseen circumstance that leads to the suspension of the Provider\'s side of any market (Match_Odds,Over/Under, etc.) during a sporting event, and the market does not resume, the outcome will be settled based on the current result (win/loss) at the time of suspension. All bets placed prior to suspension will remain valid and will be settled accordingly. The company assumes no responsibility or liability for such interruptions or outcomes."', danger: true },
        ],
      },
    ],
  },
  {
    name: 'Horse Racing',
    games: [
      {
        title: 'match',
        rules: [
          { text: '1.General', danger: true },
          { text: 'All individual race markets will be determined according to the official result at the time of the \'weigh-in\' announcement (or equivalent). Subsequent disqualifications, appeals or amendments to the result will be disregarded.', danger: false },
          { text: 'If a race is abandoned or otherwise declared void, or in the event of a walkover, all bets on that race will be void.', danger: false },
          { text: 'If the scheduled venue is changed after the market has been loaded by us, all bets will be void.', danger: false },
          { text: 'Where a race does not take part on its scheduled day, all bets will be void.', danger: false },
          { text: 'If a scheduled surface type is changed (e.g. turf to dirt) all bets will stand.', danger: false },
          { text: '2.Non-Runner Rule', danger: true },
          { text: 'Our\'s non-runner rule relates to the adjustment of odds on bets already matched when a horse in a race is declared a non-runner. In order to make the adjustment We applies a reduction factor to the remaining runners. The reduction factor allocated to a non-runner is a calculation (the details of which are described below) of that horse\'s chances of winning (or being placed, etc as appropriate) and is applied to bets already matched on the other runners in the relevant market or markets.', danger: false },
          { text: 'Any horse listed when the relevant market is loaded which does not subsequently come under starter\'s orders is deemed to be a non-runner.', danger: false },
          { text: 'When the market is loaded each horse is given a \'reduction factor\', based on a forecast price, which is expressed as a percentage. These reduction factors may be updated periodically at the discretion of Us based on trading in the market, but after approximately 15 minutes (approximately 5 minutes for Australian and US markets) from the scheduled \'off\' time of a given race, they will be updated only in exceptional circumstances. The current reduction factor percentage for each horse can be viewed on the \'info\' page on Our website or by asking the Helpdesk.', danger: false },
          { text: 'Accurate reduction factors will only be applied to selections in the event of a non-runner. Once a non-runner is declared each selection in the market will be given an appropriate reduction factor. Reduction factors can be amended at Our\'s discretion at any time throughout the market life cycle (including post-race).', danger: false },
          { text: 'For Australian racing, reduction factors may be updated periodically at the discretion of Us based on trading in the market, but after approximately five minutes from the scheduled off time of a given race they will be updated only in exceptional circumstances.', danger: false },
          { text: 'For Australian racing, reduction factors may be updated periodically at the discretion of Us based on trading in the market, but after approximately five minutes from the scheduled off time of a given race they will be updated only in exceptional circumstances.', danger: false },
          { text: 'Reductions will be made to both win and place markets but applied differently (as described below), and horses will have a different reduction factor for each market.', danger: false },
          { text: 'As soon as We becomes aware that a horse is an official non-runner or a highly likely non-runner, following a statement to the press from connections, the following will happen:', danger: true },
          { text: 'All matched bets on that horse will be void and the horse will be removed from the market.', danger: false },
          { text: 'In the win market: if the reduction factor of the non-runner is 2.5% or greater, the traded price of all the matched bets on the remaining horses will be reduced by an amount equal to the non-runner\'s final reduction factor and all the unmatched offers to lay will be cancelled. If the non-runner\'s reduction factor is less than 2.5%, reductions will not be applied and unmatched bets will not be cancelled.', danger: false },
          { text: 'In the place market the reduction factor of all non-runners will be applied (even if less than 2.5%) and the potential winnings in relation to matched bets on the remaining horses will be reduced by an amount equal to the non-runner\'s final reduction factor. Only if the non-runner\'s reduction factor is 4.0% or greater will all the unmatched offers to lay be cancelled.', danger: false },
          { text: 'All the reduction factors on the remaining horses will be adjusted to reflect their improved chance of winning.', danger: false },
          { text: 'Reduction factors are not applied to bets which are struck in-play. However, if a market is turned in-play prematurely by error (or, for example, there is a false start), all bets matched during this time will be subject to any later reduction factor, provided the market is turned out of play before the race commences. In the event of a late withdrawal, We reserves the right to remove the runner after completion of the race. In this case only those bets matched prior to the off will be affected by a reduction factor.', danger: false },
          { text: 'In the event of a non-runner being removed from a race in error or following incorrect information regarding a runner\'s participation, we will reinstate both the runner and all previously matched bets associated with that runner. All bets made between the time of withdrawal and reinstatement will be void in both the place market and the win market. The reduction factor applied to matched bets at the time of withdrawal will be reversed and the original prices will become valid.', danger: false },
          { text: 'Any non-runners will be removed from the relevant markets in the order in which they are brought to Our\'s attention. If We becomes aware of more than one non-runner at the same time, it will remove the non-runners from the relevant markets in racecard order.', danger: false },
          { text: 'Any non-runners will be removed from the relevant markets in the order in which they are brought to Our\'s attention. If We becomes aware of more than one non-runner at the same time, it will remove the non-runners from the relevant markets in racecard order.', danger: false },
          { text: 'If a runner is not included in a market because of an error or because of incorrect information regarding a runner\'s participation, We reserve the right to introduce the missing runner into the market at any time prior to settlement (even after the race has been run), provided that We are determined that the missing runner is not a material runner (i.e. a selection with a reduction factor of approx. 2.5% or less in the win market). In such circumstances, all pre-play unmatched and matched bets will stand, however if the runner is not introduced before the start of the race, all in-play bets will be void. However, if the missing runner is deemed to be a material runner, then the malformed market will be void and a new market will be loaded where possible.', danger: false },
          { text: '3.How the Reductions are applied for Exchange markets', danger: true },
          { text: 'In the win market, reductions will be made on the traded price. For example: if the non-runner\'s final reduction factor is 25% the traded price on all previously matched bets on other horses will be reduced by 25% - traded price of 8.0 would become 6.0 etc. And these might be further reduced if another horse is subsequently declared a non-runner.', danger: false },
          { text: 'In the EW Market, reductions will be made on the traded win price. The advertised place terms will then apply to the revised win prices. For example: if the non-runner\'s final reduction factor is 25% the traded price on all previously matched bets on other horses will be reduced by 25% - - traded price of 8.0 would become 6.0. If the each Way terms were 1/5th odds for 3 places, the corresponding price for the Place portion of the bet would reduce from 2.4 to 2.0.', danger: false },
          { text: 'In the place market, reductions will be made to the potential winnings on the bet only, and not the traded price. For example: if the non-runner\'s final reduction factor is 25% the potential winnings on all previously matched bets on the other horses will be reduced by 25% - a traded price of 8.0 would become 6.25. For example a £10 bet on a horse to be placed at a traded price of 8.0 would provide winnings of £70. If there is a non-runner with a reduction factor of 25% in the race, that factor will be applied to the £70 of potential winnings leaving potential winnings of £52.50. Therefore the revised traded price will be 6.25.', danger: false },
          { text: 'The traded price may be further reduced if any other horse(s) is subsequently declared a non-runner, however odds cannot be reduced below 1.01.', danger: false },
          { text: 'Reserves: A reserve runner may appear in the relevant markets but will have a non-applicable reduction factor until we are received confirmation that it is a confirmed runner, in which case an applicable reduction factor may apply to it.', danger: false },
          { text: 'For the avoidance of doubt, any reduction factor applicable to a non-runner replaced by a reserve, will be applied to all bets struck on the relevant markets, prior to the removal from those markets of such non-runner by Us. Likewise, should a reserve runner become a confirmed runner but subsequently become a non-runner, any reduction factor applicable to such non-runner will be applied to all bets struck on the relevant markets, prior to the removal from those markets of such non-runner by Us.', danger: false },
          { text: '4.Additional rules', danger: true },
          { text: 'Card numbers are posted as a guide only: bets are placed on a named horse.', danger: false },
          { text: 'Horses will not be coupled.', danger: false },
          { text: 'Where any horse(s) runs for purse money only it is deemed a non-runner for betting purposes. Should this result in the number of possible winners stated in the relevant Market Information being equal to or greater than the number of runners in the relevant Betfair market, all bets in the market will be void.', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'E Games',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'In the event of a match starting but not being completed, then all bets will be void.', danger: true },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Basketball',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Match Odds :-  \nPredict which team will be the winner. There must be 5 minutes or less of scheduled game time\nleft for bets to have action.', danger: false },
          { text: 'Quarter Winner :-  \nThe quarter must be completed for bets to have action, unless settlement of bets is already\ndetermined.', danger: false },
          { text: '1st Half Winner / 2nd Half Winner :- \nThe first half must be completed for first half bets to stand. If a game is postponed or cancelled\nafter the start, for game and second half bets there must be 5 minutes or less remaining for\nbets to have action, unless settlement of bets is already determined. (Including Overtime if\nplayed.)', danger: false },
          { text: 'Highest Scoring Half :- \nPredict in which half most points will be scored. OT is not included in 2nd Half.', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'MotoGP',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Chess',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Volleyball',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Match odds :- \nPredict which team will be the winner.\nBets will be void if the match is not completed.', danger: false },
          { text: 'Set Winner:-  \nIn the event of the set not being completed bets will be void. Exceptions are made for bets on\nsets which are already over, in this case the bets will be settled.', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Ice Hockey',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Match Odds Including overtime/shootouts :-   \nPredict the winner of the match including overtime and penalties. The game must be\ncompleted for bets to have action.', danger: false },
          { text: 'Period Winner :-   \nPredict the winner of the relevant period.\nThe relevant period must be completed for bets to have action, unless the specific market\noutcome is already determined.', danger: false },
          { text: 'Highest Scoring Period:-   \nIf 2 or more periods have the same score Tie will be settled as the winner. (exclude\novertime/shootouts for settlement purposes)', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Tennis',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Match Odds :-If 1st set has been not completed at the time of the retirement or disqualification, then all bets relating to that individual match will be void.after completion of 1st set in case of retirement the opponent player will be given the winner for match winner bets.', danger: false },
          { text: 'Game Winner :-  \nPredict which player will win the stated game. The nominated game will be featured in the name of the\nbet type, for example: 2ndset – 7\nth game – Winner. If a game is not completed for any reason, bets on it\nwill be void. Tie break points will not be counted for this bet type.\nunless the specific market outcome is already determined.', danger: false },
          { text: 'Under / Over Games :-  \nFinished set stand, the unfinished set can be played to its natural conclusion and settled as in\nthe example:\nExample: A set is abandoned at 4-4\nI win if I placed a bet on Over 9.5 (since any natural conclusion to the set would have at least 10\ngames);\nI lost the bet if I placed a bet on Under 9.5 (since any natural conclusion to the set would have\nat least 10 games); \nI get my stake back if I placed a bet on O/U 10.5 (it is undecided, the set could have ended 6-4).', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
          { text: '"In the event of a technical error or any unforeseen circumstance that leads to the suspension of the Provider\'s side of any market (Match_Odds,Over/Under, Game Winner, Point Winner, etc.) during a sporting event, and the market does not resume, the outcome will be settled based on the current result (win/loss) at the time of suspension. All bets placed prior to suspension will remain valid and will be settled accordingly. The company assumes no responsibility or liability for such interruptions or outcomes."', danger: true },
        ],
      },
    ],
  },
  {
    name: 'Badminton',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Match_Odds:-Predict which player will win the match. In the event of any of the named players in a match changing before the match starts then all bets are void. In the event of a match starting but not being completed, then all bets will be void.', danger: false },
          { text: 'Set Winner:-The Set must be completed for bets to stand, unless the specific market outcome is already determined.', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: true },
        ],
      },
    ],
  },
  {
    name: 'Cycling',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Mixed Martial Arts',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Motorbikes',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Athletics',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: true },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
        ],
      },
    ],
  },
  {
    name: 'Basketball 3X3',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Sumo',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Virtual sports',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: 'Handball',
    games: [
      {
        title: 'match',
        rules: [
          { text: 'Match Odds:- \nPredict which team will be the winner.\nBets will be void if the match is not completed.', danger: false },
          { text: 'Next Goal:-  \nPredict which team will score the X-th goal.', danger: false },
          { text: 'Highest Scoring Half:-  \nPredict which half will have the most goals scored (1st, 2nd or Draw).     \n\nBet will be settled on regulation time only and exclude overtime if played:', danger: false },
          { text: 'Halftime/Fulltime:-   \nPredict the result of a match at halftime and at the end of regular time. If a game is abandoned,\nbets will be void.        \nExample: If you choose 1/X, you bet on the home team to lead in the first half and the match to\nend in a draw. Extra time doesn\'t count.', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
        ],
      },
    ],
  },
  {
    name: 'Cricket',
    games: [
      {
        title: 'bookmaker',
        rules: [
          { text: '1. Due to any reason any team will be getting advantage or disadvantage we are not concerned.', danger: true },
          { text: '2. We will simply compare both teams 25 overs score higher score team will be declared winner in ODI (If both teams same score means, low wickets team will be declared winner. In case, both teams same score & same wickets means highest boundaries team will be declared winner.If all same then will be declared No result)', danger: true },
          { text: '3. We will simply compare both teams 10 overs higher score team will be declared winner in T20 matches (If both teams same score means, low wickets team will be declared winner. In case, both teams same score & same wickets means highest boundaries team will be declared winner.If all same then will be declared No result)', danger: true },
          { text: '4. Any query about the result or rates should be contacted within 7 days of the specific event, the same will not be considered valid post 7 days from the event.', danger: true },
          { text: '5. Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of vpn/robot-use/multiple entry from same IP/ multiple bets at the same time (Punching) and others. Note : only winning bets will be voided.', danger: true },
          { text: '6. In case, company will find Ground bets, Group betting, Punching bets, Multiple entries with same IP or any fraud or unusual activities are detected then Company will be void winning bets and charge penalty of 2X (Two times) from winning amount.', danger: true },
          { text: '7. If two team ends up with equal points, then result will be given based on the official point table', danger: true },
          { text: '8. Super Over Bookmaker: If the scores are level at the end of both innings in the Super Over, the same market will continue into subsequent Super Overs until a winner is declared. (This rule applicable from 19th July 2025)', danger: true },
          { text: '9. In case technical error or any circumstances any bookmaker is suspended and does not resume result will be given all previous bets will be valid (based on haar/jeet).', danger: true },
          { text: '10. If a Match, Series, or League is postponed or rescheduled before any ball is bowled, all bets for that event will be voided. However, if play has already started and the match continues on a reserve day, then all bets will remain valid.', danger: true },
          { text: '11. If, for any reason, the trophy is shared between both teams, then all related bets will be voided.', danger: true },
          { text: '12. 1-1 Over Bookmaker (IND v PAK)', danger: true },
          { text: '13. 1 Over Run IND vs 2 Over Run IND', danger: false },
          { text: '14. If Tie then No result', danger: false },
          { text: '15. Full Over must be Completed then Only Result will be Valid', danger: false },
          { text: '16. If All out then Result is Valid', danger: false },
          { text: '17. This Event Running for Every Next Over for Both Innings.', danger: false },
          { text: '18. While Running 2nd Innings, If Target Chased in Odd Over means Events will be Deleted. In case of Target Reached on Even Over first ball Means Valid for Result', danger: true },
          { text: '19. Example: After 12 over 23 Runs Pending to Chase, 13th Over Target Reached Means 13 and 14 Over Bookmaker will be Deleted. In Case 22 Runs Scored in 13th Over and Target Reached in 14.1 means Event Valid for Result.', danger: false },
        ],
      },
      {
        title: 'fancy',
        rules: [
          { text: '1. All fancy bets will be validated when match has been tied.', danger: true },
          { text: '2. All advance fancy will be suspended before toss or weather condition. All advance fancy will be voided if over reduced before match start.', danger: true },
          { text: '3. In case technical error or any circumstances any fancy is suspended and does not resume result will be given all previous bets will be valid (based on haar/jeet).', danger: true },
          { text: '4. If any case wrong rate has been given in fancy that particular bets will be cancelled.', danger: true },
          { text: '5. In any circumstances management decision will be final related to all exchange items. Our scorecard will be considered as valid if there is any mismatch in online portal.', danger: true },
          { text: '6. In case customer make bets in wrong fancy we are not liable to delete. No changes will be made and bets will be consider as confirm bet.', danger: true },
          { text: '7. Due to any technical error market is open and result has came all bets after result will be deleted.', danger: true },
          { text: '8. Manual bets are not accepted in our exchange.', danger: true },
          { text: '9.Our exchange will provide 5 second delay in our TV.', danger: true },
          { text: '10. Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same IP and others. Note : only winning bets will be voided.', danger: true },
          { text: '11. Company reserves the right to void any bets (only winning bets) of any event at any point of the match if the company believes there is any cheating/wrong doing in that particular event by the players (either batsman/bowler)', danger: true },
          { text: '12. Once our exchange give username and password it is your responsibility to change a password.', danger: true },
          { text: '13. Penalty runs will be counted in all fancy. (This rule applicable from 20th March 2024)', danger: true },
          { text: '14. Warning:- live scores and other data on this site is sourced from third party feeds and may be subject to time delays and/or be inaccurate. If you rely on this data to place bets, you do so at your own risk. Our exchange does not accept responsibility for loss suffered as a result of reliance on this data.', danger: true },
          { text: '15. Traders will be block the user ID if find any misinterpret activities, No queries accept regarding.', danger: true },
          { text: '16. Company will not delete No ball and Short run bets below amount of INR.10k. It\'s will be delete only INR 10k,PKR 30000,BDT 15000,USD 100,HKD 1000,AED 500,SLR 30000,GBP 100 and above amount. Company reserves the right to delete any bets including below 10k also if found to be Ground bets.\n (This rule applicable from IST 19:00 Hours on 1st May 2025)', danger: true },
          { text: '17. Our exchange is not responsible for misuse of client id.', danger: true },
          { text: '18.In case, company will find Ground bets, Group betting, Punching bets, Multiple entries with same IP or any fraud or unusual activities are detected then Company will be void winning bets and charge penalty of 2X (Two times) from winning amount.', danger: true },
          { text: 'TEST', danger: true },
          { text: '1 Session:-', danger: true },
          { text: '1.1 Complete session valid in test.', danger: false },
          { text: '1.2 Middle session and Session is not completed due to Innings declared or all out so that particular over considered as completed and remaining over counted in next team Innings for ex:- In case of Innings declared or all out In 131.5th over Considered as 132 over completed remaining 1 over counted for 133 over middle session and 3 over counted for 135 over session from next team Innings and One over session and Only over session is not completed due to innings declared so that Particular over session bets will be deleted and all out considered as valid for ex:- In case of Innings declared In 131.5th over so 132 over will be deleted and if all out then 132 over and Only 132 over will be Valid.', danger: false },
          { text: '1.3 1st day 1st session run minimum 25 over will be played then result is given otherwise 1st day 1st session will be deleted.', danger: false },
          { text: '1.4 1st day 2nd session run minimum 25 over will be played then result is given otherwise 1st day 2nd session will be deleted.', danger: false },
          { text: '1.5 1st day total run minimum 80 over will be played then result is given otherwise 1st day total run will be deleted. If a team get All Out before the day stumps, the other team\'s 1st day score will be added to 1st day total run event. (i.e. AUSTRALIA got all out at 251 before the day stumps, then ENGLAND hit 100 runs in the remaining overs of 1st day, so the result of 1st day total run event will be 351)', danger: false },
          { text: '1.6 Test match both advance session is valid.', danger: false },
          { text: '2 Test lambi/ Inning run:-', danger: true },
          { text: '2.1 Mandatory 70 over played in test lambi paari/ Innings run. If any team all-out or declaration lambi paari/ innings run is valid.', danger: false },
          { text: '2.2 In case due to weather situation match has been stopped all lambi trades will be deleted.', danger: false },
          { text: '2.3 In test both lambi paari / inning run is valid in advance fancy.', danger: false },
          { text: '3 Test batsman:-', danger: true },
          { text: '3.1 In case batsmen is injured he/she is made 34 runs the result will be given 34 runs.', danger: false },
          { text: '3.2 Batsman 50/100 run if batsman is injured or declaration the result will be given on particular run.', danger: false },
          { text: '3.3 In next men out fancy if player is injured particular fancy will be deleted.', danger: false },
          { text: '3.4 In advance fancy opening batsmen is only valid if same batsmen came in opening the fancy will be valid in case one batsmen is changed that particular player fancy will be deleted.', danger: false },
          { text: '3.5 Test match both advance fancy batsmen run is valid.', danger: false },
          { text: '4 Test partnership:-', danger: true },
          { text: '4.1 In partnership one batsman is injured or Retired out means partnership will continued in next batsman.', danger: false },
          { text: '4.2 Partnership and player runs due to weather condition or match abandoned or match completed, then the result will be given as per score.', danger: false },
          { text: '4.3 Advance partnership is valid in case both players are different or same.', danger: false },
          { text: '4.4 Test match both advance fancy partnership is valid.', danger: false },
          { text: '5 Other fancy advance (test):-', danger: true },
          { text: '5.1 Four, sixes, wide, wicket, extra run, total run, highest over and top batsmen is valid only if 300 overs has been played or the match has been won by any team otherwise all these fancy will be deleted. Additionally all events are valid only for 1st innings( this is applicable to all individual team events also)', danger: false },
          { text: '2 Odi rule:-', danger: true },
          { text: 'Session:-', danger: true },
          { text: 'Match 1st over run advance fancy only 1st innings run will be counted.', danger: false },
          { text: 'Complete session is valid in case due to rain or match abandoned particular session will be deleted.', danger: false },
          { text: 'For example:- 35 over run team a is playing any case team A is all-out in 33 over team a has made 150 run the session result is validated on particular run.', danger: false },
          { text: 'Advance session is valid in only 1st innings.', danger: false },
          { text: '50 over runs:-', danger: true },
          { text: 'In case 50 over is not completed all bet will be deleted due to weather or any condition.', danger: false },
          { text: 'Advance 50 over runs is valid in only 1st innings.', danger: false },
          { text: 'Odi batsman runs:-', danger: true },
          { text: 'In case batsman is injured he/she is made 34 runs the result will be given 34 runs.', danger: false },
          { text: 'In next men out fancy if player is injured particular fancy will be deleted.', danger: false },
          { text: 'In advance fancy opening batsmen is only valid if same batsmen came in opening the fancy will be valid in case one batsmen is changed that particular player fancy will be deleted.', danger: false },
          { text: 'Odi partnership runs:-', danger: true },
          { text: 'In partnership one batsman is injured or Retired out means partnership will continued in next batsman.', danger: false },
          { text: 'Advance partnership is valid in case both players are different or same.', danger: false },
          { text: 'Both team advance partnerships are valid in particular match.', danger: false },
          { text: 'Other fancy:-', danger: true },
          { text: 'Four, sixes, wide, wicket, extra run, total run, highest over ,top batsman,maiden over,caught-out,no-ball,run-out,fifty and century are valid only match has been completed in case due to rain over has been reduced all other fancy will be deleted.', danger: false },
          { text: 'T20:-', danger: true },
          { text: 'Session:-', danger: true },
          { text: 'Match 1st over run advance fancy only 1st innings run will be counted.', danger: false },
          { text: 'Complete session is valid in case due to rain or match abandoned particular session will be deleted.', danger: false },
          { text: 'For example :- 15 over run team a is playing any case team a is all-out in 13 over team A has made 100 run the session result is validated on particular run.', danger: false },
          { text: 'Advance session is valid in only 1st innings.', danger: false },
          { text: '20 over runs:-', danger: true },
          { text: 'Advance 20 over run is valid only in 1st innings. 20 over run will not be considered as valid if 20 overs is not completed due to any situation.', danger: false },
          { text: '3.) No ball free hit ball bets will be voided.', danger: false },
          { text: 'Badla Rule:', danger: true },
          { text: '1.) Our session rate 45/46 means you can chances to bet 5 upper and down  badla rate (Ex: Badla Down rate 40,41,42,43,44 and Badla Upper rate  47,48,49,50,51).', danger: false },
          { text: 'If the result is your chosen badla rate, you will make a profit. If the result is our rate, you will make a loss. If any other results all badla bets will be voided.', danger: false },
          { text: '2.)\tIf session rate 45.110.90 then you can chances to bet only upper badla value. (Ex: Upper badla value is 46,47,48,49,50).', danger: false },
          { text: 'If the result is your chosen badla rate, you will get 90% profit. If the result is our rate, you will get 110% loss.', danger: false },
          { text: 'T20 batsman runs:-', danger: true },
          { text: 'In case batsman is injured he/she is made 34 runs the result will be given 34 runs.', danger: false },
          { text: 'In next men out fancy if player is injured particular fancy will be deleted.', danger: false },
          { text: 'In advance fancy opening batsmen is only valid if same batsmen came in opening the fancy will be valid in case one batsmen is changed that particular player fancy will be deleted.', danger: false },
          { text: 'T20 partnership runs:-', danger: true },
          { text: 'In partnership one batsman is injured or Retired out means partnership will continued in next batsman.', danger: false },
          { text: 'Advance partnership is valid in case both players are different or same.', danger: false },
          { text: 'Both team advance partnerships are valid in particular match.', danger: false },
          { text: '1st 2 & 3 & 4 Wickets runs:- T20/ODI', danger: true },
          { text: 'Advance event is valid in only 1st Innings.', danger: false },
          { text: 'If over reduced due to rain or weather condition or match abandoned or match completed, then the result will be given as per score.', danger: false },
          { text: 'Other fancy:-', danger: true },
          { text: 'T-20 ,one day and test match in case current innings player and partnership are running in between match has been called off or abandoned that situation all current player and partnership results are valid.', danger: false },
          { text: 'Four, sixes, wide, wicket, extra run, total run, highest over and top batsman,maiden over,caught-out,no-ball,run-out,fifty and century are valid only match has been completed in case due to rain over has been reduced all other fancy will be deleted. 1st 6 over dot ball and 20 over dot ball fancy only valid is 1st innings.', danger: false },
          { text: '1st wicket lost to any team balls meaning that any team 1st wicket fall down in how many balls that particular fancy at least minimum one ball have to be played otherwise bets will be deleted.', danger: false },
          { text: '1st wicket lost to any team fancy valid both innings.', danger: false },
          { text: 'How many balls for 50 runs any team meaning that any team achieved 50 runs in how many balls that particular fancy at least one ball have to be played otherwise that fancy bets will be deleted.', danger: false },
          { text: 'How many balls for 50 runs fancy any team only first inning valid.', danger: false },
          { text: '1st 6 inning boundaries runs any team fancy will be counting only according to run scored fours and sixes at least 6 over must be played otherwise that fancy will be deleted.', danger: false },
          { text: '1st inning 6 over boundaries runs any team run like wide ,no-ball ,leg-byes ,byes and over throw runs are not counted this fancy.', danger: false },
          { text: 'How many balls face any batsman meaning that any batsman how many balls he/she played that particular fancy at least one ball have to be played otherwise that fancy bets will be deleted.', danger: false },
          { text: 'How many balls face by any batsman both innings valid.', danger: false },
          { text: 'Lowest scoring over will be considered valid only if the over is completed fully (all six deliveries has to be bowled)', danger: false },
          { text: 'Total Wickets: If a Batsman Retired hurt or Retired out means It will not be Counted in Total Wicket.', danger: false },
          { text: 'Most 4s in Single Over: Maximum number of 4s hit in a single over of the Match. No ball 4s will be counted. Byes & Leg byes 4s will not be counted.', danger: false },
          { text: 'Most 6s in Single Over : Maximum number of 6s hit in a Single over of the Match. No ball 6s will be counted.', danger: false },
          { text: 'Total No Boundaries over\'s: Number of over\'s where no boundaries (fours or sixes) are scored. If a team all out or Match Resulted in 15.1 then considered as 16 over. Team wise 1st Innings only Considered. Total Match means Both Innings will be considered.', danger: false },
          { text: 'Total Impact over\'s: Number of over\'s scored 10 runs or above. If a team all out or Match Resulted in 15.1 then considered as 16 over. Team wise 1st Innings only Considered. Total Match means Both Innings will be considered.', danger: false },
          { text: 'Total Reviews Taken in Full Match: Number of Reviews taken in full match. Wickets, Wide & No ball Reviews will be Considered.', danger: false },
          { text: 'Total Match Successful Reviews: Number of Reviews are Successful. Successful means Original decision must be changed.', danger: false },
          { text: 'Total Match Unsuccessful Reviews: Number of Reviews are Unsuccessful. Unsuccessful means Original decision same after DRS.', danger: false },
          { text: 'Total Reviews Resulted Umpire\'s Call: Number of Reviews Resulted Umpire\'s Call during the Wicket Review.', danger: false },
          { text: 'Total Reviews Taken by Batting Team: Number of Reviews taken by batting team. Both Innings will be Considered.', danger: false },
          { text: 'Total Reviews Taken by Bowling Team: Number of Reviews taken by bowling team. Both Innings will be Considered.', danger: false },
          { text: 'Total Reviews Taken by Team: Number of Reviews taken by Particular team during Batting and Bowling.', danger: false },
          { text: 'Total Match 30s : How many batsman\'s scored 30 to 49 runs in full match. If a Player reached 50 means, Not considered in this Event.', danger: false },
          { text: 'Total Boundaries in 1st Power play : Number of Boundaries Scored in 1st Power play, 1st Innings only Valid In T20/ODI Both', danger: false },
          { text: 'Total Dot balls in 1st Power play : Number of Dot balls coming in 1st Power play, 1st Innings only Valid In T20/ODI Both', danger: false },
          { text: 'Total match Wicket keeper\'s Dismissals: Wicket keepers Caught outs and Stumping Only Considered In T20/ODI Both', danger: false },
          { text: '1st Inn Death Over Runs : Runs Scored, Last Over Only Considered, 1st Innings only Valid', danger: false },
          { text: 'Total Match Single Digit Scores By Players : Duck outs Not Considered in this Event. If Not out Batsman/Injured Batsman facing One Legal Delivery and nothing scored (\'0\') means Considered as Single Digit', danger: false },
          { text: 'Most Balls Faced By a Batsman : Maximum Balls Faced by an Individual Batsman in Match', danger: false },
          { text: 'High Pship Boundaries in the Match : Maximum Number of Boundaries Scored during any Partnership', danger: false },
          { text: 'Total Impact over\'s: Number of over\'s scored 10 runs or above. If a team all out or Match Resulted in 15.1 then considered as 16 over. Team wise only 1st inning are valid and Match wise both innings are valid.', danger: false },
          { text: 'Total Match Four Hitters : Number of Batsman hitting Fours in full match.', danger: false },
          { text: 'Total Match Six Hitters : Number of Batsman hitting Sixes in full match.', danger: false },
          { text: 'Total Match Wicket Takers : Number of bowlers taking wickets in full match.', danger: false },
          { text: '100 balls Event: The events for 1 to 100 balls will be considered valid only if the number of balls mentioned has been played completely. However if the balls got reduced before the particular event then the same will be voided, if the team batting first get all out prior to 100 balls the balance balls will be counted from second innings. For example if team batting first gets all out in 81 balls balance 19 balls will be counted from second innings and that 19 balls all events are counted. This same is valid for 1st Innings only.', danger: false },
          { text: 'Concussion in Test:-', danger: true },
          { text: 'All bets of one over session will be deleted in test scenario, in case session is incomplete. For example innings declared or match suspended to bad light or any other conditions.', danger: false },
          { text: '1. All bets will be considered as valid if a player has been replaced under concussion substitute, result will be given for the runs scored by the mentioned player. For example DM Bravo gets retired hurt at 23 runs, then result will be given for 23.', danger: false },
          { text: '2. Bets of both the player will be valid under concussion substitute.', danger: false },
          { text: 'Line Market :-', danger: true },
          { text: 'The result will be given of the particular Line Market only if the mentioned over is completed or the batting team is bowled out(All Out) or the target is chased down.', danger: false },
          { text: 'Note : Penalty runs will be included in all the\u00a0Line\u00a0Markets.', danger: true },
          { text: 'Total Match- Events (test):-', danger: true },
          { text: 'Minimum of 300 overs to be bowled in the entire test match, otherwise all bets related to the particular event will get void. For example, Total match caught outs will be valid only if 300 overs been bowled in the particular test match', danger: false },
          { text: 'Limited over events-Test:-', danger: true },
          { text: 'This event will be considered valid only if the number of overs defined on the particular event has been bowled, otherwise all bets related to this event will get void. For example 0-25 over events will be valid only if 25 overs has been bowled, else the same will not be considered as valid', danger: false },
          { text: 'If the team gets all out prior to any of the defined overs, then balance overs will be counted in next innings. For example if the team gets all out in 23.1 over the same will be considered as 24 overs and the balance overs will be counted from next innings.', danger: false },
          { text: 'Bowler Wicket event\'s- Test:-', danger: true },
          { text: 'Minimum of one legal over (one complete over) has to be bowled by the bowler mentioned in the event, else the same will not be considered as valid.', danger: false },
          { text: 'Bowler over events- Test:-', danger: true },
          { text: 'The mentioned bowler has to complete the defined number of overs, else the bets related to that particular event will get void. For example if the mentioned bowler has bowled 8 overs, then 5 over run of that particular bowler will be considered as valid and the 10 over run will get void.', danger: false },
          { text: 'Player ball event\'s- Test:-', danger: true },
          { text: 'This event will be considered valid only if the defined number of runs made by the mentioned player, else the result will be considered as 0 (zero) balls.', danger: false },
          { text: 'For example if Root makes 20 runs in 60 balls and gets out on 22 runs, result for 20 runs will be 60 balls and the result for balls required for 25 run Root will be considered as 0 (Zero) and the same will be given as result', danger: false },
          { text: 'Limited over events-ODI:-', danger: true },
          { text: 'This event will be considered valid only if the number of overs defined on the particular event has been bowled, otherwise all bets related to this event will get void. 0-50 over events will be valid only if 50 over completed, if the team batting first get all out prior to 50 over the balance over will be counted from second innings. For example if team batting first gets all out in 35 over balance 15 over will be counted from second innings, the same applies for all events if team gets all out before the defined number of overs.', danger: false },
          { text: 'The events which remains incomplete will be voided if over gets reduced in the match due to any situation, for example if match interrupted in 15 overs due to rain/badlight and post this over gets reduced. Events for 0-10 will be valid, all other events related to this type will get deleted.', danger: false },
          { text: 'This events will be valid only if the defined number of over is completed. For example team batting first gets all out in 29.4 over then the same will be considered as 30 over, the team batting second must complete 20 overs only then 0-50 over events will be considered as valid. In case team batting second gets all out in 19.4 over then 0-50 over event will not be considered as valid, This same is valid for 1st Innings only.', danger: false },
          { text: 'Bowler event- ODI:-', danger: true },
          { text: 'The mentioned bowler has to complete the defined number of overs, else the bets related to that particular event will get void. For example if the mentioned bowler has bowled 8 overs, then 5 over run of that particular bowler will be considered as valid and the 10 over run will get void.', danger: false },
          { text: 'Both innings are valid', danger: false },
          { text: 'Other event:- T20', danger: true },
          { text: 'The events for 1-10 over and 11-20 over will be considered valid only if the number of over mentioned has been played completely. However if the over got reduced before the particular event then the same will be voided, if the team batting first get all out prior to 20 over the balance over will be counted from second innings. For example if team batting first gets all out in 17 over balance 3 over will be counted from second innings and that 3 over all events are counted. This same is valid for 1st Innings only.', danger: false },
          { text: 'If over got reduced in between any running event, then the same will be considered valid and the rest will be voided. For example.., match started and due to rain/bad light or any other situation match got interrupted at 4 over and later over got reduced. Then events for 1-10 is valid rest all will be voided', danger: false },
          { text: 'Bowler Session: Bowler session advance events only valid for 1st inning. This event is valid only if the bowler has completed his maximum quota of overs, else the same will be voided. However if the match has resulted and the particular bowler has already started bowling his final over then result will be given even if he haven\'t completed the over. For example B Kumar is bowling his final over and at 3.4 the match has resulted then result will be given for B Kumar over runs', danger: false },
          { text: 'Dot ball Event:', danger: true },
          { text: 'Only No run will count as dot ball.', danger: false },
          { text: 'If wicket means that will not count as dot ball.', danger: false },
          { text: 'Most Dot balls By a Bowler Event:', danger: true },
          { text: 'Leg bye run and wickets considered as Dot\u00a0ball\u00a0in\u00a0bowler', danger: false },
          { text: 'Boundary on Match 1st Free hit', danger: true },
          { text: 'Both innings are valid', danger: false },
          { text: 'Boundary hit on Free hit only be considered as valid', danger: false },
          { text: 'Bets will be deleted if there is no Free hit in the mentioned match', danger: false },
          { text: 'Boundary by bat will be considered as valid', danger: false },
          { text: 'Boundaries by Player', danger: true },
          { text: 'Both Four and six are valid', danger: false },
          { text: 'No Boundaries Event:', danger: true },
          { text: 'Both Four and Six are valid', danger: false },
          { text: 'Batsman bat boundaries only considered as valid', danger: false },
          { text: 'Free hit boundaries also valid', danger: false },
          { text: 'Bets will be voided if that particular ball not completed', danger: false },
          { text: 'Result will be given 0 or 4 (No or Yes). For Example batsman hit boundary in particular ball means Result is 0 otherwise Result is 4.', danger: false },
          { text: 'Two boundaries bhav in Single over:', danger: true },
          { text: 'Both Four and Six are valid', danger: false },
          { text: 'Batsman bat boundaries only considered as valid', danger: false },
          { text: 'Free hit boundaries also valid', danger: false },
          { text: 'Incomplete over bets will be deleted. Incase Two boundaries hit before over completed then valid.', danger: false },
          { text: 'Result will be given 2 or 0 (Yes or No). For Example batsman hits two boundaries in particular over Result is 2 otherwise Result is 0.', danger: false },
          { text: 'Bowler Session:', danger: true },
          { text: 'The mentioned bowler has to complete the defined number of overs, else the bets related to that particular event will get void. For example if the mentioned bowler has bowled 8 overs, then 5 over run of that particular bowler will be considered as valid and the 10 over run will get void.', danger: false },
          { text: 'Wide & No ball runs will be counted in bowler Session.', danger: false },
          { text: 'Byes & Leg byes runs will not be counted in bowler Session.', danger: false },
          { text: 'Inning Run Bhav Event :', danger: true },
          { text: 'Inning run bhav bets are valid if over reduced due to rain or weather condition or match abandoned the result will be given as per official result.', danger: false },
          { text: 'Settlement occurs once the stipulated conditions are met, which involves either completion\nof the allotted overs or the batting team\'s dismissal, including weather disturbances.', danger: false },
          { text: 'In the event of a weather-shortened match, all Bhav Bets placed in the Inning Run Bhav\nmarket will be settled according to the official result. For limited overs matches, this includes\nresults determined by the Duckworth Lewis method.', danger: false },
          { text: 'In case of pitch vandalism, player safety concerns, stadium damage, acts of terrorism, or acts\nof God, the company holds the authority to nullify all bets, with the exception of those related\nto markets that have already been conclusively settled.', danger: false },
          { text: 'Bets made during instances of incorrect scorecard updates, inaccurate commentary, delays in\nsuspending the Bhav Bets of Total Innings Runs market, or erroneous updates of rates and\nodds for Bhav Bets in Total Innings Runs will be removed and deleted from user accounts.', danger: false },
          { text: 'Ex: 1st inning run bhav(ENG v AUS),2nd Inning run bhav(ENG v AUS) - England vs Australia T20 Match', danger: false },
          { text: 'Power Surge Rule in Big Bash', danger: true },
          { text: 'Power Play First Four Overs + Power Surge Two Overs-Batters Choice', danger: false },
          { text: 'The batting side chooses when to take control with the addition of the Power Surge.', danger: false },
          { text: 'There\'s still a four-over power play at the start of the innings, but now the batting team can take the other two Power Surge overs any time from the 11th over onwards.', danger: false },
          { text: 'Total Runs in Match:', danger: true },
          { text: '1. This market is based on how many runs will be scored in the match across both team\'s innings combined.', danger: false },
          { text: '2. Penalty runs will be counted.', danger: false },
          { text: '3. Total Runs in Match, bets will be voided if over reduced in 1st inning or 2nd inning due to weather condition.', danger: false },
          { text: '4. The following number of over\'s must be bowled otherwise all bets are void. T20-40 over\'s / Odi-100 over\'s, if team gets all out before the defined number of over\'s then valid.', danger: false },
          { text: '5. In case match shortened due to weather condition, a new event will be start of the allotted over\'s announced.', danger: false },
          { text: 'Total runs: This market is based on how many runs will be scored in the match across both team\'s innings combined.', danger: false },
          { text: 'Total Over\'s: This market is based on how many over\'s will be played in the match across both team\'s innings combined. (If an Inning completed in 83.4 over\'s then that calculated as 84 over)', danger: false },
          { text: 'Total Bowlers Giving 100 runs: Number of Bowlers Giving 100 runs and above per innings. Both innings will be counted.', danger: false },
          { text: 'Any query regarding result or rate has to be contacted within 7 days from the event; query after 7 days from the event will not be considered as valid', danger: true },
        ],
      },
      {
        title: 'match',
        rules: [
          { text: 'Match Odds :-  \nAll bets apply to the relevant full \'regular time\' period including stoppage time.', danger: false },
          { text: 'Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.', danger: true },
          { text: 'for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from "live" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.', danger: false },
        ],
      },
    ],
  },
  {
    name: "Politics",
    games: [
      {
        title: "fancy",
        rules: [
          { text: "1. This event is to decide the winner of various legislative assemblies of india.", danger: false },
          { text: "2. The final result declared by election commission of india for assembly elections of various states of india for a particular year will be valid in our exchange ,The customers are entirely responsible for their bets at all times.", danger: false },
          { text: "3. All bets will be voided if the election doesn't take place in given time by election commission or as per our exchange management decision.", danger: false },
          { text: "4. Company reserves the right to suspend/void any bets on this event at any time if we find the same not to be legitimate with the certainty of the outcome.", danger: false },
          { text: "5. Accidental issues during assembly elections will not be counted in our exchange If required Additional candidates may be added on request.", danger: false },
          { text: "6. Kindly be informed no candidates will be partially settled and will remain in the market until it is fully settled. This is to ensure that all customers can continue trading for the candidates that they have positions on, since each candidate is still a valid runner in this market.", danger: false },
          { text: "7. Please be informed that the transmissions described as \"live\" by few broadcasters may actually be delayed due to multiple scenarios.", danger: false },
          { text: "8. If any candidate withdraws for any reason, including death, all bets on the market will be valid and be settled as per the defined rules.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Golf",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Motor Sports",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
      {
        title: "bookmaker",
        rules: [
          { text: "All race bets are settled on the official classification from the Federation Internationale de l\u2019Automobile (FIA),the sport\u2019s governing body, at the time of podium presentation.", danger: false },
          { text: "If a race is postponed ( Either before the start or via an interruption mid-race) but is concluded within 72 hours of the original scheduled start time , then all bets will stand.", danger: false },
          { text: "Our exchange management decision will be the final decision.", danger: false },
          { text: "Any query about the result should be contacted within 7 days of the specific event, the same will not be considered valid post 7 days from the event.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Baseball",
    games: [
      {
        title: "match",
        rules: [
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
        ],
      },
    ],
  },
  {
    name: "Rugby Union",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Rugby League",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Darts",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "American Football",
    games: [
      {
        title: "match",
        rules: [
          { text: "for live streaming and animation :-   \n\nAlthough the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate.  \n\nPlease also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. \n\nprovides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: true },
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
        ],
      },
    ],
  },
  {
    name: "Snooker",
    games: [
      {
        title: "match",
        rules: [
          { text: "Match Odds:-  \nPredict which player will win the match.\nIn the event of a match starting but not being completed the player progressing to the next\nround or being awarded the victory will be deemed the winner for settlement purposes.\nIn the event of a match not starting at all, all bets are refunded.", danger: false },
          { text: "Frame Winner :-  If the nominated frame is not played bets will be void. Similarly, if the nominated frame is\nawarded to a player without a shot being played, then all bets will be void.", danger: false },
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Boxing",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Soccer",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Esports",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Greyhound Racing",
    games: [
      {
        title: "match",
        rules: [
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Kabaddi",
    games: [
      {
        title: "fancy",
        rules: [
          { text: "1. In any circumstances management decision will be final related to all Fancy of kabaddi of our exchange.", danger: false },
          { text: "2. All fancy bets will be validated when match has been tied.", danger: false },
          { text: "3. Result of individual player of fancy will be validated only when player play that match.", danger: false },
          { text: "4. In any case wrong rate has been given in fancy that particular bets will be deleted.", danger: false },
          { text: "5. Final Result Of 40 Minutes Of Two Halves Will Be Valid In Our Exchange", danger: false },
          { text: "6. In case, company will find Ground bets, Group betting, Punching bets, Multiple entries with same IP or any fraud or unusual activities are detected then Company will be void winning bets and charge penalty of 2X (Two times) from winning amount.", danger: false },
          { text: "7. If any player will get injured during the match, then all the bets will be valid of that individual player", danger: false },
        ],
      },
      {
        title: "bookmaker",
        rules: [
          { text: "In case, company will find Ground bets, Group betting, Punching bets, Multiple entries with same IP or any fraud or unusual activities are detected then Company will be void winning bets and charge penalty of 2X (Two times) from winning amount.", danger: false },
          { text: "Final Result Of 40 Minutes Of Two Halves Will Be Valid In Our Exchange", danger: false },
        ],
      },
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Boat Racing",
    games: [
      {
        title: "match",
        rules: [
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Esoccer",
    games: [
      {
        title: "match",
        rules: [
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Wrestling",
    games: [
      {
        title: "bookmaker",
        rules: [
          { text: "Bookmaker (Virtual)", danger: true },
          { text: "1. For Virtual events this refers to the outcome of the simulated match as determined by the game and the platform system.", danger: false },
          { text: "2. We Consider Winning Method Pin, Submission and Ring out. (Normal One \u2013 One Match).", danger: false },
          { text: "3. We Consider Player Taking Points Method Pin, Submission and Ring out. (For Ironman only).", danger: false },
          { text: "4. In case technical error or any circumstances Bookmaker is suspended and does not resume result will be not given all bets will be deleted.", danger: false },
          { text: "5. If any case wrong rate has been given in that particular bets will be cancelled.", danger: false },
          { text: "6. The winner will be the wrestler with most points, if both wrestlers have equal number of points the match will be drawn. (For Ironman Only)", danger: false },
        ],
      },
      {
        title: "fancy",
        rules: [
          { text: "Normal (Virtual)", danger: true },
          { text: "All Fancy Advance events will be suspended either 3 minutes after the match starts or as soon as any player scores the first point \u2014 whichever happens first.", danger: true },
          { text: "1. All fancy bets will be validated when match has been tied.", danger: false },
          { text: "2. In case technical error or any circumstances Fancy is suspended and does not resume result will be not given all bets will be deleted.", danger: false },
          { text: "3. If any case wrong rate has been given in fancy that particular bets will be cancelled.", danger: false },
          { text: "4. We Consider Player Taking Points Method Pin, Submission and Ring out.", danger: false },
          { text: "5. Events are Player A Points, Player B Points and Total Match Points.", danger: false },
          { text: "6. Player A points Will be Result.", danger: false },
          { text: "7. Player B Points Will Be Result.", danger: false },
          { text: "8. Total Match Points are Consider Player A Points and Player B Points Will Be Result.", danger: false },
        ],
      },
      {
        title: "fancy1",
        rules: [
          { text: "All Fancy1 events will be suspended 10 minutes after the match begins.", danger: true },
        ],
      },
    ],
  },
  {
    name: "Beach Volleyball",
    games: [
      {
        title: "match",
        rules: [
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Table Tennis",
    games: [
      {
        title: "match",
        rules: [
          { text: "Match odds :-  \nPredict which player will win the match.\nIn the event of any of the named players in a match changing before the match starts then all\nbets are void. In the event of a match starting but not being completed, all bets will be void.", danger: false },
          { text: "Set Winner :-  \nThe specified set must be completed for bets to stand, unless the specific market outcome is\nalready determined.", danger: false },
          { text: "Under / Over Points :-  \nFor example, a game is abandoned at 9-7: bets on Over/Under 16.5 Game - Total Points are\nsettled as winners/losers respectively, since any natural conclusion to the game would have\nyielded at least 18 points.", danger: false },
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
  {
    name: "Futsal",
    games: [
      {
        title: "match",
        rules: [
          { text: "Match Odds:-  \nBets will be void if the match is not completed.", danger: true },
          { text: "Next Goal :-  \nPredict which team will score the X-th goal.", danger: false },
          { text: "1st Half Winner:-  \nHalf bets will be settled at the end of the 1\nst half. In the event of a 1\nst half not being completed\nbets will be void.", danger: false },
          { text: "Highest Scoring Half:-  \nPredict in which Event Part will be scored most.", danger: false },
          { text: "Company reserves the right to suspend/void any id/bets if the same is found to be illegitimate. For example incase of VPN/robot-use/multiple entry from same or different IP and others. Note : only winning bets will be voided.", danger: true },
          { text: "for live streaming and animation :- Although the current score, time elapsed, video and other data provided on this site is sourced from \"live\" feeds provided by third parties, you should be aware that this data may be subject to a time delay and/or be inaccurate. Please also be aware that other customers may have access to data that is faster and/or more accurate than the data shown on the site. If you rely on this data to place bets, you do so entirely at your own risk. provides this data AS IS with no warranty as to the accuracy, completeness or timeliness of such data and accepts no responsibility for any loss (direct or indirect) suffered by you as a result of your reliance on it.", danger: false },
        ],
      },
    ],
  },
];
