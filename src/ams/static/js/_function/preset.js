window.language = [
	{ "code": 'en_US', "name": 'English (United States)' },
	{ "code": 'zh_CN', "name": '中文（简体）' },
	{ "code": 'zh_TW', "name": '中文（繁體）' },
	{ "code": 'ja_JP', "name": '日本語' },
	{ "code": 'in_ID', "name": 'Bahasa Indonesia'}
];

window.walletType = {
	'transfer': [
		{ "code": 'transfer_a2p', "name": window.lang['filter']['a2pTransfer'] },
		{ "code": 'transfer_p2p', "name": window.lang['filter']['p2pTransfer'] }
	],
	'games': [
		{ "code": 'cash_game', "name": window.lang['filter']['cashGame'] },
		{ "code": 'sit_and_go', "name": window.lang['filter']['sitAndGo'] },
		{ "code": 'tournament', "name": window.lang['filter']['tournament'] },
		{ "code": 'reconciliation', "name": window.lang['filter']['reconciliation'] }
	],
	'bonus': [
		{ "code": 'ggp', "name": window.lang['filter']['ggp'] },
		{ "code": 'bonus', "name": window.lang['filter']['bonus'] },
		{ "code": 'rakeback', "name": window.lang['filter']['rakeback'] }
	],
	'casino': [
		{ "code": 'casino_game', "name": window.lang['filter']['casino'] },
		{ "code": 'live_dealer', "name": window.lang['filter']['liveDealer'] },
		{ "code": 'casino_refund', "name": window.lang['filter']['casinoRefund']}
	],
	'payment': [
		{ "code": 'psp_deposit', "name": window.lang['filter']['deposit'] },
		{ "code": 'psp_withdrawal', "name": window.lang['filter']['withdrawal'] },
		{ "code": 'psp_reconciliation', "name": window.lang['filter']['reconciliation'] }
	]
}

window.calendar = {
	title: [
		window.lang['calendar']['all'],
		window.lang['calendar']['today'],
		window.lang['calendar']['yesterday'],
		window.lang['calendar']['thisWeek'],
		window.lang['calendar']['lastWeek'],
		window.lang['calendar']['thisMonth'],
		window.lang['calendar']['lastMonth'],
		window.lang['calendar']['last7Days'],
		window.lang['calendar']['last30Days'],
		window.lang['calendar']['last90Days'],
		window.lang['calendar']['customRange']
	]
}

window.timezone = [
	{
		"key": "GMT_NEG_12",
		"code": "(UTC-12:00) Dateline",
		"timezone": "GMT-12:00"
	},
	{
		"key": "GMT_NEG_11",
		"code": "(UTC-11:00) GMT-11",
		"timezone": "GMT-11:00"
	},
	{
		"key": "GMT_NEG_10",
		"code": "(UTC-10:00) Hawaiian",
		"timezone": "GMT-10:00"
	},
	{
		"key": "GMT_NEG_9",
		"code": "(UTC-09:00) Alaskan",
		"timezone": "GMT-09:00"
	},
	{
		"key": "GMT_NEG_8",
		"code": "(UTC-08:00) Pacific",
		"timezone": "GMT-08:00"
	},
	{
		"key": "GMT_NEG_7",
		"code": "(UTC-07:00) US Mountain",
		"timezone": "GMT-07:00"
	},
	{
		"key": "GMT_NEG_6",
		"code": "(UTC-06:00) Canada Central,  Central America",
		"timezone": "GMT-06:00"
	},
	{
		"key": "GMT_NEG_5",
		"code": "(UTC-05:00) SA Pacific",
		"timezone": "GMT-05:00"
	},
	{
		"key": "GMT_NEG_430",
		"code": "(UTC-04:30) Venezuela",
		"timezone": "GMT-04:30"
	},
	{
		"key": "GMT_NEG_4",
		"code": "(UTC-04:00) Atlantic",
		"timezone": "GMT-04:00"
	},
	{
		"key": "GMT_NEG_3",
		"code": "(UTC-03:00) SA Eastern",
		"timezone": "GMT-03:00"
	},
	{
		"key": "GMT_NEG_2",
		"code": "(UTC-02:00) Mid-Atlantic",
		"timezone": "GMT-02:00"
	},
	{
		"key": "GMT_NEG_1",
		"code": "(UTC-01:00) Cape Verde",
		"timezone": "GMT-01:00"
	},
	{
		"key": "GMT_ZERO",
		"code": "(UTC+00:00) GMT, Greenwich",
		"timezone": "GMT+00:00"
	},
	{
		"key": "GMT_PLUS_1",
		"code": "(UTC+01:00) W. Central Africa",
		"timezone": "GMT+01:00"
	},
	{
		"key": "GMT_PLUS_2",
		"code": "(UTC+02:00) South Africa",
		"timezone": "GMT+02:00"
	},
	{
		"key": "GMT_PLUS_3",
		"code": "(UTC+03:00) E. Africa, Arab",
		"timezone": "GMT+03:00"
	},
	{
		"key": "GMT_PLUS_4",
		"code": "(UTC+04:00) Arabian, Georgian",
		"timezone": "GMT+04:00"
	},
	{
		"key": "GMT_PLUS_430",
		"code": "(UTC+04:30) Afghanistan",
		"timezone": "GMT+04:30"
	},
	{
		"key": "GMT_PLUS_5",
		"code": "(UTC+05:00) West Asia",
		"timezone": "GMT+05:00"
	},
	{
		"key": "GMT_PLUS_530",
		"code": "(UTC+05:30) Sri Lanka, India",
		"timezone": "GMT+05:30"
	},
	{
		"key": "GMT_PLUS_545",
		"code": "(UTC+05:45) Nepal",
		"timezone": "GMT+05:45"
	},
	{
		"key": "GMT_PLUS_6",
		"code": "(UTC+06:00) Central Asia",
		"timezone": "GMT+06:00"
	},
	{
		"key": "GMT_PLUS_630",
		"code": "(UTC+06:30) Myanmar",
		"timezone": "GMT+06:30"
	},
	{
		"key": "GMT_PLUS_7",
		"code": "(UTC+07:00) SE Asia",
		"timezone": "GMT+07:00"
	},
	{
		"key": "GMT_PLUS_8",
		"code": "(UTC+08:00) China, Ulaanbaatar, Singapore, Taipei",
		"timezone": "GMT+08:00"
	},
	{
		"key": "GMT_PLUS_9",
		"code": "(UTC+09:00) Korea, Tokyo",
		"timezone": "GMT+09:00"
	},
	{
		"key": "GMT_PLUS_930",
		"code": "(UTC+09:30) AUS Central",
		"timezone": "GMT+09:30"
	},
	{
		"key": "GMT_PLUS_10",
		"code": "(UTC+10:00) West Pacific, E. Australia",
		"timezone": "GMT+10:00"
	},
	{
		"key": "GMT_PLUS_11",
		"code": "(UTC+11:00) Central Pacific",
		"timezone": "GMT+11:00"
	},
	{
		"key": "GMT_PLUS_12",
		"code": "(UTC+12:00) New Zealand",
		"timezone": "GMT+12:00"
	},
	{
		"key": "GMT_PLUS_13",
		"code": "(UTC+13:00) Tonga",
		"timezone": "GMT+13:00"
	}
];