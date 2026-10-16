// 99.0001 BACCARAT: the markets casino.kingexch111.com showed for this table
// (captured from the reference, 1366 px: between rounds, all suspended).
// UI only: the backend replaces it with the live table.
export default {
  game: {
    status: 'SUSPEND',
    roundId: '',
    cards: {
      PLAYER: { card_1: 'D9_', card_2: 'DJ_', card_3: '0' },
      BANKER: { card_1: 'S3_', card_2: '0', card_3: '0' },
    },
    marketArr: [
      {
        marketId: '911610062407',
        marketName: 'WINNER',
        min: 100,
        max: 100000,
        status: 'SUSPEND',
        runners: [
          {
            selectionId: '38371235',
            status: 'SUSPEND',
            price: { back: [{ price: 1.95, size: 499500 }], lay: [] },
          },
          {
            selectionId: '38847854',
            status: 'SUSPEND',
            price: { back: [{ price: 1.95, size: 494000 }], lay: [] },
          },
        ],
        runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
      },
      {
        marketId: '911610062408',
        marketName: 'TIE',
        min: 100,
        max: 100000,
        status: 'SUSPEND',
        runners: [
          {
            selectionId: '39578955',
            status: 'SUSPEND',
            price: { back: [{ price: 8, size: 500000 }], lay: [] },
          },
        ],
        runnersName: { '39578955': 'TIE' },
      },
      {
        marketId: '911610062409',
        marketName: 'PAIR',
        min: 100,
        max: 100000,
        status: 'SUSPEND',
        runners: [
          {
            selectionId: '539764342',
            status: 'SUSPEND',
            price: { back: [{ price: 11, size: 500000 }], lay: [] },
          },
          {
            selectionId: '963223764',
            status: 'SUSPEND',
            price: { back: [{ price: 11, size: 500000 }], lay: [] },
          },
        ],
        runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
      },
    ],
  },
  results: [
    {
      roundId: '911610062329',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'P',
      cards: {
        PLAYER: { card_1: 'H8_', card_2: 'CJ_', card_3: '0' },
        BANKER: { card_1: 'C4_', card_2: 'S2_', card_3: '0' },
      },
      results: [
        {
          marketId: '911610062330',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'WINNER' },
            { selectionId: '38847854', result: 'LOSER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610062331',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610062332',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610062248',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'B',
      cards: {
        PLAYER: { card_1: 'S9_', card_2: 'S2_', card_3: 'SJ_' },
        BANKER: { card_1: 'S6_', card_2: 'DK_', card_3: '0' },
      },
      results: [
        {
          marketId: '911610062249',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'LOSER' },
            { selectionId: '38847854', result: 'WINNER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610062250',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610062251',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610062200',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'T',
      cards: {
        PLAYER: { card_1: 'S3_', card_2: 'S8_', card_3: 'S10_' },
        BANKER: { card_1: 'C10_', card_2: 'SK_', card_3: 'HA_' },
      },
      results: [
        {
          marketId: '911610062201',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'LOSER' },
            { selectionId: '38847854', result: 'LOSER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610062202',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'WINNER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610062203',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610062121',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'B',
      cards: {
        PLAYER: { card_1: 'CQ_', card_2: 'DK_', card_3: '0' },
        BANKER: { card_1: 'H3_', card_2: 'H6_', card_3: '0' },
      },
      results: [
        {
          marketId: '911610062122',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'LOSER' },
            { selectionId: '38847854', result: 'WINNER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610062123',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610062124',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610062039',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'P',
      cards: {
        PLAYER: { card_1: 'DA_', card_2: 'H7_', card_3: '0' },
        BANKER: { card_1: 'S4_', card_2: 'D6_', card_3: '0' },
      },
      results: [
        {
          marketId: '911610062040',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'WINNER' },
            { selectionId: '38847854', result: 'LOSER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610062041',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610062042',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610061948',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'B',
      cards: {
        PLAYER: { card_1: 'C2_', card_2: 'H2_', card_3: 'D9_' },
        BANKER: { card_1: 'HJ_', card_2: 'H2_', card_3: 'S5_' },
      },
      results: [
        {
          marketId: '911610061949',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'LOSER' },
            { selectionId: '38847854', result: 'WINNER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610061950',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610061951',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'WINNER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610061857',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'P',
      cards: {
        PLAYER: { card_1: 'D4_', card_2: 'HJ_', card_3: 'D3_' },
        BANKER: { card_1: 'D7_', card_2: 'S3_', card_3: 'SA_' },
      },
      results: [
        {
          marketId: '911610061858',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'WINNER' },
            { selectionId: '38847854', result: 'LOSER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610061859',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610061860',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610061810',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'B',
      cards: {
        PLAYER: { card_1: 'S3_', card_2: 'DA_', card_3: 'S6_' },
        BANKER: { card_1: 'D9_', card_2: 'S2_', card_3: 'S6_' },
      },
      results: [
        {
          marketId: '911610061811',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'LOSER' },
            { selectionId: '38847854', result: 'WINNER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610061812',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610061813',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610061730',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'P',
      cards: {
        PLAYER: { card_1: 'H3_', card_2: 'H5_', card_3: '0' },
        BANKER: { card_1: 'C5_', card_2: 'H8_', card_3: '0' },
      },
      results: [
        {
          marketId: '911610061731',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'WINNER' },
            { selectionId: '38847854', result: 'LOSER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610061732',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610061733',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
    {
      roundId: '911610061643',
      eventId: '99.0001',
      eventName: 'BACCARAT',
      winner: 'B',
      cards: {
        PLAYER: { card_1: 'CA_', card_2: 'SJ_', card_3: '0' },
        BANKER: { card_1: 'D7_', card_2: 'SA_', card_3: '0' },
      },
      results: [
        {
          marketId: '911610061644',
          marketName: 'WINNER',
          index: 0,
          runners: [
            { selectionId: '38371235', result: 'LOSER' },
            { selectionId: '38847854', result: 'WINNER' },
          ],
          runnersName: { '38371235': 'PLAYER', '38847854': 'BANKER' },
        },
        {
          marketId: '911610061645',
          marketName: 'TIE',
          index: 1,
          runners: [{ selectionId: '39578955', result: 'LOSER' }],
          runnersName: { '39578955': 'TIE' },
        },
        {
          marketId: '911610061646',
          marketName: 'PAIR',
          index: 2,
          runners: [
            { selectionId: '539764342', result: 'LOSER' },
            { selectionId: '963223764', result: 'LOSER' },
          ],
          runnersName: { '539764342': 'PLAYER PAIR', '963223764': 'BANKER PAIR' },
        },
      ],
    },
  ],
};
