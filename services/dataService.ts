import { MPFFund } from '../types';

// Encapsulated CSV Data from the provided file
// Header row normalized to single line for easier parsing
const RAW_CSV_DATA = `Sequence #,Scheme,Constituent Fund,MPF Trustee,Fund Type,Launch Date,Fund size (HKD' m),Risk Class,Latest FER (%),2024 Calendar Year Return (%),2023 Calendar Year Return (%),2022 Calendar Year Return (%),2021 Calendar Year Return (%),2020 Calendar Year Return (%),1 Year Annualized return (% p.a.),5 Year Annualized return (% p.a.),10 Year Annualized return (% p.a.),Since Launch Year Annualized return (% p.a.),1 Year Cumulative return (%),5 Year Cumulative return (%),10 Year Cumulative return (%),Since Launch Year Cumulative return (%),Management Fees (% p.a.),Breakdown of Management Fee (% p.a.) - Administration Fee or eMPF Platform Fee/ Trustee Fee/ Custodian Fee,Breakdown of Management Fee (% p.a.) - Sponsor Fee/Member Servicing Fee,Breakdown of Management Fee (% p.a.) - Investment Management Fee,Guarantee Charge (% p.a.)
1,AIA MPF - Prime Value Choice,Age 65 Plus Fund,AIAT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,"2,458.73",4,0.78633,3.09,7.1,-14.78,0.89,8.12,6.01,0.79,n.a.,2.27,6.01,3.99,n.a.,21.22,Up to 0.75,0.5,0,Up to 0.25,0
2,AIA MPF - Prime Value Choice,American Fund,AIAT,Equity Fund - United States Equity Fund,23-09-2011,"6,828.32",6,0.8202,22.3,24.29,-19.3,26.5,10.53,19.25,16.24,11.85,11.22,19.25,112.23,206.44,348.5,Up to 0.82,0.6,0,Up to 0.22,0
3,AIA MPF - Prime Value Choice,Asian Bond Fund,AIAT,Bond Fund - Asia Bond Fund,23-09-2011,"1,839.18",4,0.78523,1.91,3.96,-8.62,-5.72,8.06,6.15,0.05,1.68,1.28,6.15,0.24,18.12,19.7,Up to 0.9895,0.6,0,Up to 0.3895,0
4,AIA MPF - Prime Value Choice,Asian Equity Fund,AIAT,Equity Fund - Asia Equity Fund,1/12/04,"9,694.57",6,1.69349,7.24,13.62,-18.15,6.26,28.1,30.89,12.48,9.63,7.49,30.89,80,150.77,353.25,Up to 1.5795,0.85,0,Up to 0.7295,0
5,AIA MPF - Prime Value Choice,Balanced Portfolio,AIAT,Mixed Assets Fund - 41% to 60% Equity,1/12/00,"8,487.67",5,1.66923,4.72,4.69,-16.22,0.19,11.46,13.92,3.16,3.37,3.89,13.92,16.83,39.34,159.02,Up to 1.625,0.85,0,Up to 0.775,0
6,AIA MPF - Prime Value Choice,Capital Stable Portfolio,AIAT,Mixed Assets Fund - 21% to 40% Equity,1/12/00,"4,580.87",4,1.66408,2.3,4.72,-15,-1.17,9.58,9.81,1.38,2.17,3.1,9.81,7.1,23.9,114.15,Up to 1.625,0.85,0,Up to 0.775,0
7,AIA MPF - Prime Value Choice,China HK Dynamic Asset Allocation Fund,AIAT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,4/7/17,"1,201.37",6,1.2554,11.49,-9.08,-13.15,-8.03,8.72,15.93,0.74,n.a.,1.83,15.93,3.75,n.a.,16.34,Up to 1.2,0.85,0,Up to 0.35,0
8,AIA MPF - Prime Value Choice,Core Accumulation Fund,AIAT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"8,246.39",5,0.77931,9.55,14.13,-16.22,9.63,11.98,13.83,7.45,n.a.,6.71,13.83,43.2,n.a.,74.66,Up to 0.75,0.5,0,Up to 0.25,0
9,AIA MPF - Prime Value Choice,Eurasia Fund,AIAT,Equity Fund - Uncategorized Equity Fund,23-09-2011,"1,028.66",6,0.83797,3.31,12.97,-16.32,6.96,4.25,23.17,9.42,5.55,6.41,23.17,56.85,71.6,140.16,Up to 0.9,0.6,0,Up to 0.3,0
10,AIA MPF - Prime Value Choice,European Equity Fund,AIAT,Equity Fund - Europe Equity Fund,1/1/02,"3,273.07",6,1.67286,1.22,19.12,-14.27,20.05,3.06,21.94,14.02,6.47,5.75,21.94,92.72,87.14,278.81,Up to 1.5795,0.85,0,Up to 0.7295,0
11,AIA MPF - Prime Value Choice,Global Bond Fund,AIAT,Bond Fund - Global Bond Fund,1/12/07,"3,440.99",4,0.97634,-1.64,5.09,-19.55,-5.61,11.61,4.44,-2.82,0.31,0.82,4.44,-13.33,3.15,15.69,Up to 0.985,0.6,0,Up to 0.385,0
12,AIA MPF - Prime Value Choice,Greater China Equity Fund,AIAT,Equity Fund - Greater China Equity Fund,1/12/04,"19,012.94",7,1.6716,15.61,-5.76,-22.98,-7.15,40.24,34.08,4.04,7.34,6.33,34.08,21.91,102.99,261.29,Up to 1.625,0.85,0,Up to 0.775,0
13,AIA MPF - Prime Value Choice,Green Fund,AIAT,Equity Fund - Global Equity Fund,31-03-2006,"7,756.99",6,1.40513,17.29,22.9,-18.79,21.87,13.76,20.08,14.55,10.07,6.71,20.08,97.27,161.06,257.15,Up to 1.595,0.895,0,Up to 0.7,0
14,AIA MPF - Prime Value Choice,Growth Portfolio,AIAT,Mixed Assets Fund - 81% to 100% Equity,1/12/00,"17,283.00",5,1.6677,10.2,6.98,-16.8,3.71,15.76,22.61,7.89,6.48,5.54,22.61,46.2,87.39,283.05,Up to 1.625,0.85,0,Up to 0.775,0
15,AIA MPF - Prime Value Choice,Guaranteed Portfolio,AIAT,Guaranteed Fund,1/12/00,"10,444.55",1,1.55718,1.13,0.23,0.15,0.15,0.15,1.6,0.6,0.38,1.33,1.6,3.05,3.85,38.89,1.5,0.85,0,0.65,0
16,AIA MPF - Prime Value Choice,Hong Kong and China Fund,AIAT,Equity Fund - Hong Kong Equity Fund,23-09-2011,"6,155.01",7,0.77514,21.81,-11.15,-13.38,-13.64,-1.77,30.27,3.6,3.4,4.43,30.27,19.32,39.7,84.3,Up to 0.82,0.6,0,Up to 0.22,0
17,AIA MPF - Prime Value Choice,Manager's Choice Fund,AIAT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,1/8/08,"5,256.41",4,1.46266,5.16,4.6,-16.37,2.76,10.56,14.19,4.38,4.14,4.89,14.19,23.89,50.06,127.99,Up to 1.73,0.85,0,Up to 0.88,0
18,AIA MPF - Prime Value Choice,MPF Conservative Fund,AIAT,Money Market Fund - MPF Conservative Fund,1/12/00,"10,781.20",1,0.77701,3.23,3.08,0.66,0.11,0.45,2.27,1.77,1.13,0.89,2.27,9.17,11.9,24.7,Up to 0.974,0.614,0,Up to 0.36,0
19,AIA MPF - Prime Value Choice,North American Equity Fund,AIAT,Equity Fund - United States Equity Fund,1/1/02,"12,247.60",6,1.67186,21.46,22.94,-17.73,27.16,14.5,16.39,15.2,11.36,7.14,16.39,102.93,193.19,417.89,Up to 1.625,0.85,0,Up to 0.775,0
20,AIA MPF - Prime Value Choice,World Fund,AIAT,Equity Fund - Global Equity Fund,1/12/07,"4,347.11",6,0.83946,15.48,20.17,-18.22,19.17,7.61,20.55,14,9.54,5.64,20.55,92.51,148.78,167.24,Up to 0.9,0.6,0,Up to 0.3,0
21,AMTD MPF Scheme,AMTD Allianz Choice Balanced Fund,BCT,Mixed Assets Fund - 61% to 80% Equity,10/7/09,68.54,5,1.30435,8.02,5.02,-15.76,2.15,18.14,18.4,5.51,5.38,4.91,18.4,30.8,68.91,118.56,Up to 0.97,Up to 0.57,0,0.4,0
22,AMTD MPF Scheme,AMTD Allianz Choice Capital Stable Fund,BCT,Mixed Assets Fund - 21% to 40% Equity,10/7/09,43.34,4,1.32314,2.19,4.43,-14.43,-1.24,11.81,9.57,1.27,2.45,2.25,9.57,6.53,27.46,43.78,Up to 0.97,Up to 0.57,0,0.4,0
23,AMTD MPF Scheme,AMTD Allianz Choice Dynamic Allocation Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,10/7/09,30.21,3,1.31531,3.16,3.53,-7.2,5.85,8.17,8.04,3.58,3.15,2.85,8.04,19.22,36.46,58.27,Up to 0.97,Up to 0.57,0,0.4,0
24,AMTD MPF Scheme,AMTD Allianz Choice Growth Fund,BCT,Mixed Assets Fund - 81% to 100% Equity,10/7/09,108.81,5,1.3096,11.01,5.52,-16.84,4.13,20.87,22.96,7.63,6.64,6.19,22.96,44.47,90.23,166.34,Up to 0.97,Up to 0.57,0,0.4,0
25,AMTD MPF Scheme,AMTD Allianz Choice Stable Growth Fund,BCT,Mixed Assets Fund - 41% to 60% Equity,10/7/09,95.77,5,1.28901,5.13,4.78,-15.48,0.26,15.24,14.16,3.32,3.97,3.61,14.16,17.73,47.69,78.42,Up to 0.97,Up to 0.57,0,0.4,0
26,AMTD MPF Scheme,AMTD Invesco Age 65 Plus Fund,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,25.75,4,0.85993,3.63,7.93,-14.86,0.58,9.53,7.15,1.19,n.a.,2.45,7.15,6.11,n.a.,23.15,0.75,0.58,0,0.17,0
27,AMTD MPF Scheme,AMTD Invesco Asia Fund,BCT,Equity Fund - Asia Equity Fund,10/7/09,66.08,6,1.39747,6.27,1.56,-22.81,-7.99,18.09,23.34,3.02,4.27,4.56,23.34,16.05,51.99,106.97,1,0.6,0,0.4,0
28,AMTD MPF Scheme,AMTD Invesco Core Accumulation Fund,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,58.12,5,0.86243,10.81,15.7,-16.47,9.87,12.6,15.45,8.2,n.a.,6.98,15.45,48.32,n.a.,78.47,0.75,0.58,0,0.17,0
29,AMTD MPF Scheme,AMTD Invesco Europe Fund,BCT,Equity Fund - Europe Equity Fund,10/7/09,36.85,5,1.38831,-2.88,19.31,-12.62,17.32,-6.49,19.04,12.43,4.18,5.56,19.04,79.72,50.65,141.99,1,0.6,0,0.4,0
30,AMTD MPF Scheme,AMTD Invesco Global Bond Fund,BCT,Bond Fund - Global Bond Fund,10/7/09,45.82,4,1.41519,-1.3,5.72,-13.23,-4.22,8.67,4.57,-1.24,0.59,0.47,4.57,-6.07,6.09,7.97,1,0.6,0,0.4,0
31,AMTD MPF Scheme,AMTD Invesco Hong Kong and China Fund,BCT,Equity Fund - Hong Kong Equity Fund,10/7/09,160.49,7,1.34494,12.51,-19.75,-19.57,-18.49,10.29,29.29,-3.14,1.54,2.44,29.29,-14.76,16.56,48.27,1,0.6,0,0.4,0
32,AMTD MPF Scheme,AMTD Invesco MPF Conservative Fund,BCT,Money Market Fund - MPF Conservative Fund,10/7/09,158.56,1,1.18126,3.13,2.63,0.3,0,0.55,1.98,1.51,0.94,0.58,1.98,7.8,9.77,9.86,0.9,0.5,0,0.4,0
33,AMTD MPF Scheme,AMTD Invesco Target 2028 Retirement Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,10/7/09,23.6,4,1.72087,2.47,4.86,-15.1,-1.93,8.46,11.48,1.84,2.66,3.27,11.48,9.56,30.1,69.05,1,0.6,0,0.4,0
34,AMTD MPF Scheme,AMTD Invesco Target 2038 Retirement Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,10/7/09,17.11,5,1.54486,4.4,4.68,-15.77,-1.04,8.46,14.89,3.26,3.74,4.31,14.89,17.41,44.41,99.11,1,0.6,0,0.4,0
35,AMTD MPF Scheme,AMTD Invesco Target 2048 Retirement Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,10/7/09,16.52,5,1.66115,6,4.18,-16.77,-0.23,8.59,18.18,4.43,4.45,4.98,18.18,24.2,54.58,121,1,0.6,0,0.4,0
36,AMTD MPF Scheme,AMTD Invesco Target Retirement Now Fund,BCT,Mixed Assets Fund - 21% to 40% Equity,10/7/09,12.71,4,1.90157,1.32,4.8,-14.56,-2.88,8.45,9.85,0.84,1.99,2.46,9.85,4.29,21.77,48.74,1,0.6,0,0.4,0
37,BCOM Joyful Retirement MPF Scheme,BCOM Age 65 Plus Fund,BCOM,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,296.37,4,0.80352,3.84,8.47,-15.18,0.69,9.67,7.58,1.37,n.a.,2.59,7.58,7.03,n.a.,24.55,0.75,0.57,0.1,0.08,0
38,BCOM Joyful Retirement MPF Scheme,BCOM Asian Dynamic Equity (CF) Fund,BCOM,Equity Fund - Asia Equity Fund,25-10-2006,601.3,5,1.6607,9.44,4.62,-19.34,-2.82,23.75,16.53,4.73,5.55,4.68,16.53,25.98,71.56,138.75,1.29,0.81,0.1,0.38,0
39,BCOM Joyful Retirement MPF Scheme,BCOM Balanced (CF) Fund,BCOM,Mixed Assets Fund - 61% to 80% Equity,10/1/06,542.51,5,1.54952,5.85,4.54,-16.46,-0.01,17.68,16.52,4.52,4.84,4.6,16.52,24.74,60.46,143.96,1.255,0.86,0.1,0.295,0
40,BCOM Joyful Retirement MPF Scheme,BCOM China Dynamic Equity (CF) Fund,BCOM,Equity Fund - China Equity Fund,1/6/08,570.98,7,1.61505,17.53,-15.89,-27.08,-16.63,21.63,28.69,-2.52,2.7,2.29,28.69,-11.98,30.49,48.27,1.29,0.84,0.1,0.35,0
41,BCOM Joyful Retirement MPF Scheme,BCOM Core Accumulation Fund,BCOM,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,961.02,5,0.80191,11.1,16.09,-16.58,10.02,12.45,15.82,8.4,n.a.,7.09,15.82,49.67,n.a.,80.04,0.75,0.57,0.1,0.08,0
42,BCOM Joyful Retirement MPF Scheme,BCOM Dynamic Growth (CF) Fund,BCOM,Mixed Assets Fund - 81% to 100% Equity,25-10-2006,510.18,5,1.60214,10.67,5.23,-17.09,3.62,20.54,22.8,7.31,6.26,4.47,22.8,42.3,83.5,129.71,Up to 1.28,0.81,0.1,Up to 0.37,0
43,BCOM Joyful Retirement MPF Scheme,BCOM Global Bond (CF) Fund,BCOM,Bond Fund - Global Bond Fund,15-11-2010,274.4,4,1.14956,-1.4,5.92,-12.98,-4.02,9.09,4.75,-1.11,0.83,1.03,4.75,-5.45,8.65,16.55,0.84 - 0.96,0.44,0.1,0.3 - 0.42,0
44,BCOM Joyful Retirement MPF Scheme,BCOM Greater China Equity (CF) Fund,BCOM,Equity Fund - Greater China Equity Fund,15-11-2010,588.82,7,1.54498,12.05,-7.43,-23.18,-10.88,40.62,36.3,1.91,5.68,4.22,36.3,9.94,73.82,85.63,Up to 1.28,0.81,0.1,Up to 0.37,0
45,BCOM Joyful Retirement MPF Scheme,BCOM Guaranteed (CF) Fund,BCOM,Guaranteed Fund,1/12/00,898.74,4,1.72174,5,2.76,-5.25,-2.43,2.31,8.41,1.85,1.48,1.65,8.41,9.62,15.81,50.31,1.285,0.81,0.1,0.375,0.135
46,BCOM Joyful Retirement MPF Scheme,BCOM Hong Kong Dynamic Equity (CF) Fund,BCOM,Equity Fund - Hong Kong Equity Fund,17-10-2007,509.29,7,1.56437,14.9,-12.89,-21.26,-15.6,16.18,31.9,-0.14,3.16,1.52,31.9,-0.69,36.47,31.37,1.34,0.81,0.1,0.43,0
47,BCOM Joyful Retirement MPF Scheme,BCOM HSI ESG Tracking (CF) Fund,BCOM,Equity Fund - Hong Kong Equity Fund (Index Tracking),30-09-2009,649.03,7,0.95698,10.48,-15.51,-13.46,-12.63,-1.47,31.18,1.32,2.47,2.67,31.18,6.76,27.61,52.81,0.8,0.65,0.08,0.22,0
48,BCOM Joyful Retirement MPF Scheme,BCOM MPF Conservative Fund,BCOM,Money Market Fund - MPF Conservative Fund,1/12/00,"1,770.23",1,0.93116,3.31,3.24,0.43,0,0.76,2.21,1.81,1.38,1.45,2.21,9.38,14.67,43.26,0.8975,0.6175,0.1,0.18,0
49,BCOM Joyful Retirement MPF Scheme,BCOM North American Equity (CF) Fund,BCOM,Equity Fund - United States Equity Fund,1/2/23,271.72,n.a.,1.06137,21.94,n.a.,n.a.,n.a.,n.a.,18.94,n.a.,n.a.,18.41,18.94,n.a.,n.a.,59.17,1.07 - 1.12,0.72,0.15,0.2 - 0.25,0
50,BCOM Joyful Retirement MPF Scheme,BCOM Stable Growth (CF) Fund,BCOM,Mixed Assets Fund - 41% to 60% Equity,10/1/06,657.6,5,1.53999,2.66,3.97,-16.63,-1.63,14.71,12.44,2.08,3.07,3.4,12.44,10.82,35.34,93.8,1.255,0.86,0.1,0.295,0
51,BCT (MPF) Industry Choice,BCT (Industry) Age 65 Plus Fund,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,465.68,4,0.85349,3.81,8.4,-15.19,0.64,9.67,7.5,1.33,n.a.,2.56,7.5,6.84,n.a.,24.3,0.75,0.67,0,0.08,0
52,BCT (MPF) Industry Choice,BCT (Industry) Asian Equity Fund,BCT,Equity Fund - Asia Equity Fund,1/5/04,528.51,6,1.74461,9.74,1.2,-22.73,1.54,24.18,23.35,5.4,6.26,7.51,23.35,30.09,83.45,375.07,Up to 1.6,Up to 0.895,0.1,0.605,0
53,BCT (MPF) Industry Choice,BCT (Industry) China and Hong Kong Equity Fund,BCT,Equity Fund - Hong Kong Equity Fund,1/10/02,946.54,7,1.6756,15.99,-16.26,-19.12,-16.08,17.33,29.72,0.15,3.49,6.81,29.72,0.74,40.87,357.63,Up to 1.52,Up to 0.705,0.1,0.715,0
54,BCT (MPF) Industry Choice,BCT (Industry) Core Accumulation Fund,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,789.47,5,0.8549,11.03,16.02,-16.61,9.95,12.47,15.74,8.34,n.a.,6.92,15.74,49.27,n.a.,77.74,0.75,0.67,0,0.08,0
55,BCT (MPF) Industry Choice,BCT (Industry) E30 Mixed Asset Fund,BCT,Mixed Assets Fund - 21% to 40% Equity,1/12/00,476.43,4,1.68707,1.57,5.26,-14.82,-2.9,9.27,8.92,0.72,1.92,3.1,8.92,3.65,21,113.98,Up to 1.53,Up to 1,0.1,0.43,0
56,BCT (MPF) Industry Choice,BCT (Industry) E50 Mixed Asset Fund,BCT,Mixed Assets Fund - 41% to 60% Equity,1/12/00,409.24,5,1.6987,3.85,5.14,-15.72,-1.89,9.49,12.67,2.33,2.97,3.62,12.67,12.2,33.96,142.88,Up to 1.53,Up to 1,0.1,0.43,0
57,BCT (MPF) Industry Choice,BCT (Industry) E70 Mixed Asset Fund,BCT,Mixed Assets Fund - 61% to 80% Equity,1/12/00,599.49,5,1.69592,6.22,5.07,-16.74,-0.95,9.44,16.66,3.95,4.03,4.02,16.66,21.36,48.42,167.42,Up to 1.53,Up to 1,0.1,0.43,0
58,BCT (MPF) Industry Choice,BCT (Industry) Flexi Mixed Asset Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,1/8/05,193.77,3,1.63473,2.79,3.25,-7.53,5.34,7.9,7.64,3.19,2.79,3.08,7.64,17.01,31.62,84.93,Up to 1.52,Up to 0.97,0.1,0.45,0
59,BCT (MPF) Industry Choice,BCT (Industry) Global Bond Fund,BCT,Bond Fund - Global Bond Fund,1/10/02,160.46,4,1.58107,-3.54,2.34,-13.6,-4.31,0.98,3.73,-2.67,-1.55,1.1,3.73,-12.67,-14.44,28.67,Up to 1.45,Up to 0.8,0.1,0.55,0
60,BCT (MPF) Industry Choice,BCT (Industry) Global Equity Fund,BCT,Equity Fund - Global Equity Fund,1/10/02,517.47,6,1.49977,16.88,18.42,-23.04,21.61,8.82,18.9,13.21,7.01,6.88,18.9,85.98,96.88,364.82,Up to 1.585,Up to 0.8,0.1,0.685,0
61,BCT (MPF) Industry Choice,BCT (Industry) MPF Conservative Fund,BCT,Money Market Fund - MPF Conservative Fund,1/12/00,"1,777.38",1,0.97483,3.33,3.04,0.32,0,0.66,2.16,1.66,1.07,0.86,2.16,8.6,11.24,23.81,0.88,0.58,0.1,0.2,0
62,BCT (MPF) Industry Choice,BCT (Industry) RMB Bond Fund,BCT,Bond Fund - RMB Bond Fund,4/3/13,200.77,3,1.27371,0.96,2.53,-5.45,2.23,6.31,2.78,1.35,1.18,0.69,2.78,6.92,12.43,9.17,1.175,0.625,0.1,0.45,0
63,BCT (MPF) Pro Choice,BCT (Pro) Age 65 Plus Fund,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,"1,248.32",4,0.77716,3.85,8.44,-15.06,0.72,9.56,7.53,1.38,n.a.,2.61,7.53,7.1,n.a.,24.78,0.75,0.67,0,0.08,0
64,BCT (MPF) Pro Choice,BCT (Pro) Asian Equity Fund,BCT,Equity Fund - Asia Equity Fund,1/5/04,"5,064.30",6,1.60674,9.23,1.09,-22.59,-1.99,23.07,23.43,4.56,6.1,7.54,23.43,24.98,80.72,377.63,1.5,0.66,0.26,0.58,0
65,BCT (MPF) Pro Choice,BCT (Pro) Asian Income Retirement Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,25-04-2022,426.83,3,1.56887,0.81,-1.79,n.a.,n.a.,n.a.,5.68,n.a.,n.a.,0.81,5.68,n.a.,n.a.,2.9,Up to 1.288,Up to 0.648,0.24,0.4,0
66,BCT (MPF) Pro Choice,BCT (Pro) China and Hong Kong Equity Fund,BCT,Equity Fund - Hong Kong Equity Fund,1/1/08,"9,444.87",7,1.48503,13.59,-16.04,-20.73,-16.21,20.94,29.88,-0.96,3.18,0.96,29.88,-4.7,36.7,18.67,1.43,0.66,0.26,0.51,0
67,BCT (MPF) Pro Choice,BCT (Pro) Core Accumulation Fund,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"5,128.38",5,0.77864,11.06,16.08,-16.51,9.98,12.53,15.76,8.38,n.a.,7.08,15.76,49.53,n.a.,80.04,0.75,0.67,0,0.08,0
68,BCT (MPF) Pro Choice,BCT (Pro) E30 Mixed Asset Fund,BCT,Mixed Assets Fund - 21% to 40% Equity,1/12/00,"2,049.49",4,1.50039,1.5,5.36,-17,-3.35,10.45,9.01,0.22,1.76,2.8,9.01,1.1,19.12,98.97,1.44,0.66,0.26,0.52,0
69,BCT (MPF) Pro Choice,BCT (Pro) E50 Mixed Asset Fund,BCT,Mixed Assets Fund - 41% to 60% Equity,1/12/00,"2,758.81",5,1.50375,4.35,5.62,-17.66,-1.54,12.01,12.87,2.31,3.18,3.63,12.87,12.12,36.72,143,1.44,0.66,0.26,0.52,0
70,BCT (MPF) Pro Choice,BCT (Pro) E70 Mixed Asset Fund,BCT,Mixed Assets Fund - 61% to 80% Equity,1/12/00,"5,223.01",5,1.50659,7.21,5.88,-18.43,0.3,13.34,16.93,4.42,4.52,4.21,16.93,24.12,55.59,179.55,1.44,0.66,0.26,0.52,0
71,BCT (MPF) Pro Choice,BCT (Pro) E90 Mixed Asset Fund,BCT,Mixed Assets Fund - 81% to 100% Equity,27-10-2008,"1,029.61",5,1.50875,9.98,6.18,-19.08,2.32,14.2,20.89,6.53,5.55,7,20.89,37.22,71.7,216.33,1.44,0.66,0.26,0.52,0
72,BCT (MPF) Pro Choice,BCT (Pro) European Equity Fund,BCT,Equity Fund - Europe Equity Fund,1/1/08,"1,281.11",5,1.56831,-2.05,18.54,-14.01,15.22,-1.85,14.23,10.98,4.05,3.24,14.23,68.34,48.67,76.81,1.5,0.66,0.26,0.58,0
73,BCT (MPF) Pro Choice,BCT (Pro) Flexi Mixed Asset Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,1/8/05,"1,524.51",3,1.34922,3.07,3.52,-7.25,5.61,8.17,7.89,3.46,3.07,3.38,7.89,18.52,35.35,96.04,Up to 1.32,Up to 0.63,0.24,0.45,0
74,BCT (MPF) Pro Choice,BCT (Pro) Global Bond Fund,BCT,Bond Fund - Global Bond Fund,1/10/02,"1,944.58",4,1.44457,-2.63,4.95,-15.97,-6.07,7.76,3.86,-2.77,-0.58,1.73,3.86,-13.09,-5.66,48.57,1.4,0.66,0.26,0.48,0
75,BCT (MPF) Pro Choice,BCT (Pro) Global Equity Fund,BCT,Equity Fund - Global Equity Fund,1/10/02,"6,782.30",5,1.48709,15.21,19,-19.49,17.16,12.48,19.27,12.51,8.04,7.54,19.27,80.3,116.67,436.53,1.44,0.66,0.26,0.52,0
76,BCT (MPF) Pro Choice,BCT (Pro) Greater China Equity Fund,BCT,Equity Fund - Greater China Equity Fund,28-06-2012,"2,232.19",6,1.11247,15.87,-2.55,-21.49,-6.59,15.23,24.58,2.99,5.81,5.46,24.58,15.85,75.95,103.47,Up to 0.99,0.58,0.14,Up to 0.31,0
77,BCT (MPF) Pro Choice,BCT (Pro) Hang Seng Index Tracking Fund,BCT,Equity Fund - Hong Kong Equity Fund (Index Tracking),1/10/09,"4,894.38",7,0.82718,21.83,-11.26,-13.27,-12.58,-1.53,30.3,3.98,3.92,3.62,30.3,21.55,46.88,77.25,0.73 - 0.79,Up to 0.605,0.14,Up to 0.045,0
78,BCT (MPF) Pro Choice,BCT (Pro) Hong Kong Dollar Bond Fund,BCT,Bond Fund - Hong Kong Dollar Bond Fund,1/10/09,"1,377.35",3,1.06685,3.02,5.96,-9.07,-1.37,6.13,4.36,0.62,1.38,1.68,4.36,3.14,14.66,30.8,0.9995,0.4595,0.14,0.4,0
79,BCT (MPF) Pro Choice,BCT (Pro) MPF Conservative Fund,BCT,Money Market Fund - MPF Conservative Fund,1/12/00,"11,091.72",1,0.89678,3.4,3.18,0.32,0,0.72,2.18,1.71,1.12,0.91,2.18,8.84,11.82,25.28,0.88,0.44,0.14,0.3,0
80,BCT (MPF) Pro Choice,BCT (Pro) RMB Bond Fund,BCT,Bond Fund - RMB Bond Fund,4/3/13,917.83,3,1.22958,1.05,2.74,-5.48,2.2,6.24,2.79,1.39,1.17,0.69,2.79,7.15,12.38,9.14,1.175,0.585,0.14,0.45,0
81,BCT (MPF) Pro Choice,BCT (Pro) SaveEasy 2025 Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,811.47,5,1.23829,4.37,4.33,-19.94,0.97,14.05,9.49,1.94,3.93,6.31,9.49,10.1,47.03,183.34,Up to 1.2,Up to 0.56,0.14,0.5,0
82,BCT (MPF) Pro Choice,BCT (Pro) SaveEasy 2030 Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,822.31,5,1.48814,9.53,4.43,-20.55,1.11,14.6,17.86,4.73,5.36,7.1,17.86,25.97,68.56,221.41,Up to 1.2,Up to 0.56,0.14,0.5,0
83,BCT (MPF) Pro Choice,BCT (Pro) SaveEasy 2035 Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,865.72,6,1.49038,10.53,4.32,-20.82,1.28,14.9,19.15,5.21,5.59,7.16,19.15,28.91,72.27,224.38,Up to 1.45,Up to 0.56,0.14,0.75,0
84,BCT (MPF) Pro Choice,BCT (Pro) SaveEasy 2040 Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,"1,965.76",6,1.48462,10.97,4.37,-20.85,1.29,14.86,20.28,5.52,5.75,7.46,20.28,30.84,74.91,240.21,Up to 1.45,Up to 0.56,0.14,0.75,0
85,BCT (MPF) Pro Choice,BCT (Pro) SaveEasy 2045 Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,23-11-2021,131.03,6,1.54241,10.81,4.45,-19.86,n.a.,n.a.,19.97,n.a.,n.a.,3.14,19.97,n.a.,n.a.,12.95,Up to 1.45,Up to 0.56,0.14,0.75,0
86,BCT (MPF) Pro Choice,BCT (Pro) SaveEasy 2050 Fund,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,23-11-2021,230.24,6,1.50881,10.86,4.23,-19.73,n.a.,n.a.,20.41,n.a.,n.a.,3.37,20.41,n.a.,n.a.,13.96,Up to 1.45,Up to 0.56,0.14,0.75,0
87,BCT (MPF) Pro Choice,BCT (Pro) U.S. Equity Fund,BCT,Equity Fund - United States Equity Fund,23-11-2021,"4,129.56",6,0.9538,21.76,25.1,-22.31,n.a.,n.a.,20.13,n.a.,n.a.,8.99,20.13,n.a.,n.a.,40.42,Up to 0.99,0.56,0.24,Up to 0.19,0
88,BCT (MPF) Pro Choice,BCT (Pro) World Equity Fund,BCT,Equity Fund - Global Equity Fund,28-06-2012,"3,709.69",5,1.0284,14.76,18.26,-17.76,18,10.94,20.52,12.81,9.48,9.41,20.52,82.73,147.43,232.15,Up to 0.99,0.56,0.24,Up to 0.61,0
89,BCT Strategic MPF Scheme,Invesco Age 65 Plus Fund - Unit Class A,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,765.72,4,0.80013,3.88,8.53,-15.18,0.69,9.7,7.58,1.39,n.a.,2.62,7.58,7.15,n.a.,24.84,0.75,0.3,0.1,0.35,0
90,BCT Strategic MPF Scheme,Invesco Age 65 Plus Fund - Unit Class H,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,629.88,4,0.7993,3.88,8.53,-15.18,0.69,9.7,7.58,1.39,n.a.,2.62,7.58,7.15,n.a.,24.84,0.75,0.3,0.1,0.35,0
91,BCT Strategic MPF Scheme,Invesco Asian Equity Fund - Unit Class A,BCT,Equity Fund - Asia Equity Fund,28-09-2007,650.42,6,1.31055,6.3,1.68,-22.78,-8.05,18.09,23.28,3.04,4.24,1.95,23.28,16.16,51.59,41.81,1.16,0.61,0.1,0.45,0
92,BCT Strategic MPF Scheme,Invesco Asian Equity Fund - Unit Class H,BCT,Equity Fund - Asia Equity Fund,3/10/07,827.85,6,1.18727,6.42,1.8,-22.69,-7.94,18.2,23.42,3.16,4.36,1.93,23.42,16.83,53.31,41.32,1.04,0.61,0.1,0.33,0
93,BCT Strategic MPF Scheme,Invesco Balanced Fund - Unit Class A,BCT,Mixed Assets Fund - 61% to 80% Equity,29-01-2001,"1,476.85",5,1.2876,5.5,5.54,-16.36,-0.52,9.89,17.54,4.26,4.41,4.29,17.54,23.21,54.04,182.95,1.16,0.61,0.1,0.45,0
94,BCT Strategic MPF Scheme,Invesco Balanced Fund - Unit Class H,BCT,Mixed Assets Fund - 61% to 80% Equity,12/2/01,"1,286.93",5,1.16432,5.62,5.66,-16.26,-0.39,10.03,17.69,4.38,4.54,4.55,17.69,23.95,55.89,200.38,1.04,0.61,0.1,0.33,0
95,BCT Strategic MPF Scheme,Invesco Capital Stable Fund - Unit Class A,BCT,Mixed Assets Fund - 21% to 40% Equity,29-01-2001,893.53,4,1.27011,1.5,5.72,-14.44,-2.49,9.72,10.27,1.21,2.44,3.42,10.27,6.2,27.24,130.11,1.16,0.61,0.1,0.45,0
96,BCT Strategic MPF Scheme,Invesco Capital Stable Fund - Unit Class H,BCT,Mixed Assets Fund - 21% to 40% Equity,12/2/01,650.69,4,1.14744,1.62,5.84,-14.34,-2.37,9.85,10.41,1.33,2.56,3.6,10.41,6.83,28.75,139.53,1.04,0.61,0.1,0.33,0
97,BCT Strategic MPF Scheme,Invesco Core Accumulation Fund - Unit Class A,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"1,044.59",5,0.80026,11.13,16.16,-16.61,10.05,12.56,15.84,8.42,n.a.,7.17,15.84,49.85,n.a.,81.27,0.75,0.3,0.1,0.35,0
98,BCT Strategic MPF Scheme,Invesco Core Accumulation Fund - Unit Class H,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,821.32,5,0.79675,11.13,16.16,-16.61,10.05,12.56,15.84,8.42,n.a.,7.17,15.84,49.85,n.a.,81.27,0.75,0.3,0.1,0.35,0
99,BCT Strategic MPF Scheme,Invesco Global Bond Fund - Unit Class A,BCT,Bond Fund - Global Bond Fund,5/3/03,508.98,4,1.25052,-1.54,5.86,-12.99,-4.1,9.07,4.62,-1.19,0.76,1.96,4.62,-5.83,7.86,55.26,1.16,0.61,0.1,0.45,0
100,BCT Strategic MPF Scheme,Invesco Global Bond Fund - Unit Class H,BCT,Bond Fund - Global Bond Fund,5/3/03,572.87,4,1.12773,-1.42,5.98,-12.89,-3.99,9.21,4.74,-1.08,0.88,2.09,4.74,-5.27,9.15,59.79,1.04,0.61,0.1,0.33,0
101,BCT Strategic MPF Scheme,Invesco Global Index Tracking Fund - Unit Class A,BCT,Equity Fund - Global Equity Fund,9/6/23,75.01,n.a.,1.15221,15.89,n.a.,n.a.,n.a.,n.a.,18.58,n.a.,n.a.,16.93,18.58,n.a.,n.a.,45.5,Up to 1.1,0.55,0.1,Up to 0.45,0
102,BCT Strategic MPF Scheme,Invesco Global Index Tracking Fund - Unit Class H,BCT,Equity Fund - Global Equity Fund,9/6/23,128.64,n.a.,1.14993,15.89,n.a.,n.a.,n.a.,n.a.,18.58,n.a.,n.a.,16.93,18.58,n.a.,n.a.,45.5,Up to 1.1,0.55,0.1,Up to 0.45,0
103,BCT Strategic MPF Scheme,Invesco Growth Fund - Unit Class A,BCT,Equity Fund - Global Equity Fund,28-12-2000,"2,762.11",6,1.29723,7.94,5.63,-17.78,0.94,9.96,21.98,6.22,5.6,4.81,21.98,35.26,72.48,221.61,1.16,0.61,0.1,0.45,0
104,BCT Strategic MPF Scheme,Invesco Growth Fund - Unit Class H,BCT,Equity Fund - Global Equity Fund,12/2/01,"2,718.55",6,1.17397,8.06,5.75,-17.68,1.06,10.09,22.12,6.35,5.72,5.01,22.12,36.07,74.55,235.28,1.04,0.61,0.1,0.33,0
105,BCT Strategic MPF Scheme,Invesco Hang Seng Index Tracking Fund - Unit Class A,BCT,Equity Fund - Hong Kong Equity Fund (Index Tracking),31-07-2014,418.47,7,0.79266,21.79,-11.14,-13.17,-12.84,-1.36,30.48,3.99,3.86,2.91,30.48,21.61,46.04,38.13,Up to 0.745,Up to 0.37,0.1,Up to 0.275,0
106,BCT Strategic MPF Scheme,Invesco Hang Seng Index Tracking Fund - Unit Class H,BCT,Equity Fund - Hong Kong Equity Fund (Index Tracking),31-07-2014,480.95,7,0.75084,21.84,-11.1,-13.14,-12.81,-1.31,30.54,4.03,3.9,2.96,30.54,21.87,46.7,38.84,Up to 0.705,Up to 0.34,0.1,Up to 0.265,0
107,BCT Strategic MPF Scheme,Invesco Hong Kong and China Equity Fund - Unit Class A,BCT,Equity Fund - Hong Kong Equity Fund,5/3/03,"1,636.92",7,1.24992,12.5,-19.97,-19.68,-18.64,10.35,29.54,-3.2,1.61,6.34,29.54,-14.99,17.3,303.27,1.16,0.61,0.1,0.45,0
108,BCT Strategic MPF Scheme,Invesco Hong Kong and China Equity Fund - Unit Class H,BCT,Equity Fund - Hong Kong Equity Fund,3/3/03,"2,123.63",7,1.12778,12.64,-19.88,-19.58,-18.54,10.49,29.7,-3.08,1.73,6.34,29.7,-14.47,18.73,302.79,1.04,0.61,0.1,0.33,0
109,BCT Strategic MPF Scheme,Invesco MPF Conservative Fund - Unit Class A,BCT,Money Market Fund - MPF Conservative Fund,29-01-2001,"1,405.74",1,0.68966,3.61,3.57,0.42,0,0.89,2.38,1.88,1.3,1.12,2.38,9.77,13.8,31.83,0.663,0.363,0.1,0.2,0
110,BCT Strategic MPF Scheme,Invesco MPF Conservative Fund - Unit Class H,BCT,Money Market Fund - MPF Conservative Fund,12/2/01,"1,455.43",1,0.68831,3.61,3.57,0.42,0,0.89,2.38,1.88,1.3,1.12,2.38,9.77,13.8,31.81,0.663,0.363,0.1,0.2,0
111,BCT Strategic MPF Scheme,Invesco RMB Bond Fund - Unit Class A,BCT,Bond Fund - RMB Bond Fund,5/3/13,164.36,3,1.24665,1,2.55,-5.45,2.21,6.3,2.82,1.36,1.16,0.57,2.82,7,12.28,7.4,1.16,0.61,0.1,0.45,0
112,BCT Strategic MPF Scheme,Invesco RMB Bond Fund - Unit Class H,BCT,Bond Fund - RMB Bond Fund,6/3/13,229.3,3,1.12379,1.13,2.67,-5.33,2.34,6.42,2.95,1.48,1.29,0.69,2.95,7.65,13.65,9.06,1.04,0.61,0.1,0.33,0
113,BCT Strategic MPF Scheme,Invesco US Index Tracking Fund - Unit Class A,BCT,Equity Fund - United States Equity Fund,9/6/23,249.33,n.a.,1.04145,21.69,n.a.,n.a.,n.a.,n.a.,16.12,n.a.,n.a.,18.11,16.12,n.a.,n.a.,49.03,Up to 1,0.55,0.1,Up to 0.35,0
114,BCT Strategic MPF Scheme,Invesco US Index Tracking Fund - Unit Class H,BCT,Equity Fund - United States Equity Fund,9/6/23,362.63,n.a.,1.03905,21.69,n.a.,n.a.,n.a.,n.a.,16.12,n.a.,n.a.,18.11,16.12,n.a.,n.a.,49.03,Up to 1,0.55,0.1,Up to 0.35,0
115,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Age 65 Plus Fund,BEA,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,"1,056.78",4,0.77571,3.42,7.57,-14.35,0.97,8.03,5.95,1.17,n.a.,2.63,5.95,6,n.a.,25.01,0.75,0.295,0.295,0.16,0
116,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Asian Equity Fund,BEA,Equity Fund - Asia Equity Fund,31-01-2012,488.76,6,1.2905,14.05,4.75,-24.41,0.03,29.61,28.47,6.74,7.83,5.9,28.47,38.58,112.43,120.18,1.2 - 1.94,0.45 - 0.5,0.44,0.31 - 1.05,0
117,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Balanced Fund,BEA,Mixed Assets Fund - 41% to 60% Equity,1/12/00,"1,871.07",5,1.34068,5.24,5.16,-17.27,-0.67,12.32,13.36,2.62,3.6,3.64,13.36,13.79,42.42,143.89,1.2 - 1.82,0.45 - 0.55,0.44,0.31 - 0.91,0
118,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Core Accumulation Fund,BEA,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"3,293.65",5,0.77687,11.36,14.63,-15.96,9.54,12.7,13.13,7.81,n.a.,7.09,13.13,45.67,n.a.,80.13,0.75,0.295,0.295,0.16,0
119,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Greater China Equity Fund,BEA,Equity Fund - Greater China Equity Fund,4/1/10,839.14,6,1.29682,15.67,-6.94,-26.93,-4.43,34.42,33.33,3.03,6.91,5.07,33.33,16.1,95.08,118.96,1.2 - 1.94,0.45 - 0.5,0.44,0.31 - 1.05,0
120,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Growth Fund,BEA,Mixed Assets Fund - 61% to 80% Equity,1/12/00,"3,650.17",5,1.37183,8.48,5.62,-18.05,1.12,13.87,18.3,4.87,4.98,4.55,18.3,26.84,62.55,203.11,1.2 - 1.82,0.45 - 0.55,0.44,0.31 - 0.91,0
121,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Hong Kong Equity Fund,BEA,Equity Fund - Hong Kong Equity Fund,4/1/10,746.52,7,1.27899,16.63,-15.36,-24.51,-15.66,15.26,33.97,-1.09,2.34,2.07,33.97,-5.32,25.99,38.33,1.2 - 1.3,0.45 - 0.5,0.44,0.31 - 0.36,0
122,BEA (MPF) Industry Scheme,BEA (Industry Scheme) MPF Conservative Fund,BEA,Money Market Fund - MPF Conservative Fund,1/12/00,"3,892.49",1,0.80767,3.41,3.42,0.35,0.01,0.66,2.08,1.76,1.27,1.45,2.08,9.12,13.51,43.02,0.79,0.45,0.03,0.31,0
123,BEA (MPF) Industry Scheme,BEA (Industry Scheme) RMB & HKD Money Market Fund,BEA,Money Market Fund - Other than MPF Conservative Fund,3/7/12,234.59,3,0.79088,0.14,1.1,-4.05,2.56,5.25,1.4,0.89,0.88,0.84,1.4,4.55,9.1,11.83,0.79,0.45,0.03,0.31,0
124,BEA (MPF) Industry Scheme,BEA (Industry Scheme) Stable Fund,BEA,Mixed Assets Fund - 21% to 40% Equity,1/12/00,"2,917.35",4,1.31067,2.09,4.49,-15.95,-2.33,9.95,8.94,0.52,2.15,2.94,8.94,2.61,23.67,105.74,1.2 - 1.82,0.45 - 0.55,0.44,0.31 - 0.91,0
125,BEA (MPF) Industry Scheme,BEA China Tracker Fund,BEA,Equity Fund - China Equity Fund,31-01-2012,176.14,7,1.17257,29.45,-12.35,-16.54,-22.11,-2.15,28.05,0.68,0.8,0.42,28.05,3.46,8.25,6,Up to 1.09,Up to 0.31,0.03,0.75,0
126,BEA (MPF) Industry Scheme,BEA Hong Kong Tracker Fund,BEA,Equity Fund - Hong Kong Equity Fund (Index Tracking),31-01-2012,196.26,7,0.58317,21.97,-10.92,-12.99,-12.36,-1.48,30.66,4.24,4.06,4.05,30.66,23.06,48.82,72.62,Up to 0.58,Up to 0.305,0.03,Up to 0.245,0
127,BEA (MPF) Master Trust Scheme,BEA (MPF) Age 65 Plus Fund,BEA,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,"1,005.82",4,0.78021,3.42,7.59,-14.35,0.96,7.97,5.95,1.17,n.a.,2.61,5.95,6,n.a.,24.76,0.75,0.295,0.295,0.16,0
128,BEA (MPF) Master Trust Scheme,BEA (MPF) Asian Equity Fund,BEA,Equity Fund - Asia Equity Fund,1/9/05,"1,130.21",6,1.3185,14.26,4.82,-24.86,-0.17,29.83,28.91,6.73,7.87,6.81,28.91,38.51,113.27,277.91,1.2 - 1.94,0.45 - 0.5,0.44,0.31 - 1.05,0
129,BEA (MPF) Master Trust Scheme,BEA (MPF) Balanced Fund,BEA,Mixed Assets Fund - 41% to 60% Equity,1/12/00,"1,804.11",5,1.34166,5.31,5.18,-17.3,-0.66,12.45,13.43,2.64,3.64,3.6,13.43,13.93,42.95,141.58,1.2 - 1.82,0.45 - 0.55,0.44,0.31 - 0.91,0
130,BEA (MPF) Master Trust Scheme,BEA (MPF) Conservative Fund,BEA,Money Market Fund - MPF Conservative Fund,1/12/00,"1,737.24",1,0.80857,3.38,3.4,0.35,-0.01,0.65,2.1,1.75,1.24,1.51,2.1,9.07,13.1,45.14,0.79,0.45,0.03,0.31,0
131,BEA (MPF) Master Trust Scheme,BEA (MPF) Core Accumulation Fund,BEA,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"1,071.79",5,0.77948,11.35,14.64,-15.96,9.54,12.73,13.12,7.81,n.a.,7.13,13.12,45.68,n.a.,80.74,0.75,0.295,0.295,0.16,0
132,BEA (MPF) Master Trust Scheme,BEA (MPF) European Equity Fund,BEA,Equity Fund - Europe Equity Fund,4/1/10,186.76,6,1.3969,1.61,15.56,-13.75,14.37,4.12,19.78,11.18,5.95,4.36,19.78,69.89,78.19,96.56,1.295 - 1.795,0.45 - 0.52,0.415,0.43 - 0.91,0
133,BEA (MPF) Master Trust Scheme,BEA (MPF) Global Bond Fund,BEA,Bond Fund - Global Bond Fund,1/9/05,355.47,4,1.0513,-2.7,3.85,-15.72,-5.43,6.8,2.84,-2.99,-0.1,0.49,2.84,-14.07,-1.01,10.47,0.99,0.45,0.23,0.31,0
134,BEA (MPF) Master Trust Scheme,BEA (MPF) Global Equity Fund,BEA,Equity Fund - Global Equity Fund,4/1/10,656.45,6,1.25072,18.07,20.67,-17.95,17.68,15.23,19.6,13.57,9.87,7.7,19.6,88.95,156.37,223.42,1.175 - 1.775,0.45 - 0.55,0.415,0.31 - 0.91,0
135,BEA (MPF) Master Trust Scheme,BEA (MPF) Greater China Equity Fund,BEA,Equity Fund - Greater China Equity Fund,1/12/06,"1,644.72",7,1.28586,16.3,-7.27,-26.84,-5.63,34.73,33.6,2.82,6.87,5.49,33.6,14.91,94.26,175.08,1.2,0.45,0.44,0.31,0
136,BEA (MPF) Master Trust Scheme,BEA (MPF) Growth Fund,BEA,Mixed Assets Fund - 61% to 80% Equity,1/12/00,"3,749.71",5,1.37488,8.53,5.64,-18.12,1.1,14.1,18.36,4.88,5.01,4.42,18.36,26.88,63.11,194.12,1.2 - 1.82,0.45 - 0.55,0.44,0.31 - 0.91,0
137,BEA (MPF) Master Trust Scheme,BEA (MPF) Hong Kong Equity Fund,BEA,Equity Fund - Hong Kong Equity Fund,1/9/05,"1,030.42",7,1.28325,16.65,-15.53,-24.51,-15.76,15.33,33.92,-1.15,2.36,4.27,33.92,-5.6,26.29,132.67,1.2 - 1.3,0.45 - 0.5,0.44,0.31 - 0.36,0
138,BEA (MPF) Master Trust Scheme,BEA (MPF) Japan Equity Fund,BEA,Equity Fund - Japan Equity Fund,1/12/06,186.21,5,1.35966,13.77,21.72,-14.1,3.89,12.39,26.49,12.02,6.73,1.93,26.49,76.36,91.84,43.69,Up to 1.765,0.45 - 0.53,0.415,Up to 0.9,0
139,BEA (MPF) Master Trust Scheme,BEA (MPF) North American Equity Fund,BEA,Equity Fund - United States Equity Fund,31-01-2012,"1,023.13",6,1.24901,20.5,23.07,-19.33,26.17,15.99,20.55,14.98,12.12,11.35,20.55,100.92,214.04,338.76,1.215 - 1.275,0.45 - 0.55,0.415,0.31 - 0.35,0
140,BEA (MPF) Master Trust Scheme,BEA (MPF) RMB & HKD Money Market Fund,BEA,Money Market Fund - Other than MPF Conservative Fund,3/7/12,160.66,3,0.79543,0.43,1.17,-4.15,2.66,5.21,1.39,0.93,0.9,0.88,1.39,4.75,9.42,12.46,0.79,0.45,0.03,0.31,0
141,BEA (MPF) Master Trust Scheme,BEA (MPF) Stable Fund,BEA,Mixed Assets Fund - 21% to 40% Equity,1/12/00,"1,840.70",4,1.31468,2.08,4.49,-16,-2.33,10.08,8.93,0.5,2.17,2.85,8.93,2.55,23.98,101.65,1.2 - 1.82,0.45 - 0.55,0.44,0.31 - 0.91,0
142,BEA (MPF) Master Trust Scheme,BEA China Tracker Fund,BEA,Equity Fund - China Equity Fund,31-01-2012,176.22,7,1.19223,29.29,-12.44,-16.58,-22.21,-2.22,27.96,0.57,0.71,0.18,27.96,2.9,7.3,2.55,Up to 1.09,Up to 0.31,0.03,0.75,0
143,BEA (MPF) Master Trust Scheme,BEA Hong Kong Tracker Fund,BEA,Equity Fund - Hong Kong Equity Fund (Index Tracking),31-01-2012,327.62,7,0.5966,21.8,-10.97,-13.11,-12.43,-1.59,30.6,4.15,3.98,4.04,30.6,22.53,47.75,72.55,Up to 0.58,Up to 0.305,0.03,Up to 0.245,0
144,BEA (MPF) Value Scheme,BEA Age 65 Plus Fund,BEA,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,12.23,4,0.84302,3.31,7.51,-14.39,0.82,8.04,5.89,1.09,n.a.,2.59,5.89,5.57,n.a.,24.55,0.75,0.295,0.295,0.16,0
145,BEA (MPF) Value Scheme,BEA Asian Equity Fund,BEA,Equity Fund - Asia Equity Fund,25-10-2012,10.98,6,0.97668,13.23,4.82,-24.21,-4.33,30.01,29.57,5.72,7.4,5.5,29.57,32.09,104.15,100.85,0.9,0.3,0.3,0.3,0
146,BEA (MPF) Value Scheme,BEA Balanced Fund,BEA,Mixed Assets Fund - 41% to 60% Equity,25-10-2012,21.4,5,0.9642,6.39,6.45,-17.54,0.76,14.26,15.36,3.67,4.63,4.18,15.36,19.76,57.22,70.41,0.9,0.3,0.3,0.3,0
147,BEA (MPF) Value Scheme,BEA Core Accumulation Fund,BEA,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,30,5,0.82147,11.31,14.58,-16,9.45,12.65,13.08,7.76,n.a.,7.19,13.08,45.31,n.a.,81.54,0.75,0.295,0.295,0.16,0
148,BEA (MPF) Value Scheme,BEA Global Bond Fund,BEA,Bond Fund - Global Bond Fund,25-10-2012,8.55,4,0.92715,-3.39,3.72,-16.28,-5.92,7.1,2.74,-3.32,-0.17,-0.34,2.74,-15.55,-1.66,-4.39,0.9,0.3,0.3,0.3,0
149,BEA (MPF) Value Scheme,BEA Global Equity Fund,BEA,Equity Fund - Global Equity Fund,25-10-2012,32.69,6,0.95234,18.59,21,-17.78,17.94,15.62,19.49,13.82,10.15,9.7,19.49,91.01,162.93,233.87,0.9,0.3,0.3,0.3,0
150,BEA (MPF) Value Scheme,BEA Greater China Equity Fund,BEA,Equity Fund - Greater China Equity Fund,25-10-2012,28.56,6,0.96335,16.15,-6.61,-26.34,-3.9,36.99,34.28,3.58,7.71,7,34.28,19.24,110.1,141.35,0.9,0.3,0.3,0.3,0
151,BEA (MPF) Value Scheme,BEA Growth Fund,BEA,Mixed Assets Fund - 61% to 80% Equity,25-10-2012,26.81,5,0.97939,9.74,7.24,-18.74,2.99,16.22,20.49,5.97,6.12,5.48,20.49,33.66,81.05,100.35,0.9,0.3,0.3,0.3,0
152,BEA (MPF) Value Scheme,BEA Hong Kong Tracker Fund,BEA,Equity Fund - Hong Kong Equity Fund (Index Tracking),25-10-2012,21.28,7,0.69026,21.59,-11.12,-13.3,-12.59,-1.61,30.61,3.98,3.87,3.55,30.61,21.53,46.2,57.52,Up to 0.69,Up to 0.245,0.2,Up to 0.245,0
153,BEA (MPF) Value Scheme,BEA MPF Conservative Fund,BEA,Money Market Fund - MPF Conservative Fund,25-10-2012,29.42,1,0.78556,3.45,3.49,0.35,0.02,0.66,1.99,1.77,1.34,1.14,1.99,9.18,14.2,15.97,0.79,0.263,0.264,0.263,0
154,BEA (MPF) Value Scheme,BEA Stable Fund,BEA,Mixed Assets Fund - 21% to 40% Equity,25-10-2012,14.07,4,0.955,3.05,5.67,-16.27,-1.38,11.38,10.71,1.35,2.98,2.6,10.71,6.92,34.15,39.69,0.9,0.3,0.3,0.3,0
155,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Age 65 Plus Fund,BOCIP,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,"1,923.27",4,0.76799,3.51,7.44,-14.69,1.06,8.68,6.08,1.01,n.a.,2.43,6.08,5.15,n.a.,22.9,0.75,0.45,0,0.3,0
156,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Asia Equity Fund,BOCIP,Equity Fund - Asia Equity Fund,3/10/06,"4,307.95",6,1.70266,10.12,5,-16.96,0.22,17.69,23.95,7.57,6.74,4.37,23.95,44.04,91.92,126.42,1.5975,0.5975,0,1,0
157,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Balanced Fund,BOCIP,Mixed Assets Fund - 41% to 60% Equity,13-12-2000,"7,808.01",5,1.67227,3.81,5.6,-15.58,0.48,10.25,14.17,3.69,3.52,3.94,14.17,19.85,41.35,161.74,1.5975,0.5975,0,1,0
158,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Bond Fund,BOCIP,Bond Fund - Global Bond Fund,15-04-2003,"3,096.33",4,1.51145,-2.66,3.61,-16.7,-5.57,6.39,3.3,-3.17,-0.76,0.9,3.3,-14.89,-7.34,22.3,1.2,0.5975,0,0.6025,0
159,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential China Equity Fund,BOCIP,Equity Fund - China Equity Fund,15-10-2007,"9,106.41",7,1.7467,19.65,-16.27,-21.49,-16.17,17.74,31.47,-0.49,2.71,-0.28,31.47,-2.42,30.71,-5.01,1.5975,0.5975,0,1,0
160,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Core Accumulation Fund,BOCIP,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"6,910.32",5,0.75807,9.73,14.39,-15.96,9.66,12.99,13.95,7.68,n.a.,7.08,13.95,44.75,n.a.,79.85,0.75,0.45,0,0.3,0
161,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential CSI HK 100 Tracker Fund,BOCIP,Equity Fund - Hong Kong Equity Fund (Index Tracking),3/9/12,"2,530.99",7,1.14744,20.54,-11.13,-16.43,-14.81,10.72,33.01,2.69,3.92,4.02,33.01,14.2,46.89,67.96,0.8325,0.57,0,0.2625,0
162,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential European Index Tracking Fund,BOCIP,Equity Fund - Europe Equity Fund,3/9/12,"1,706.98",6,1.04393,2.8,17.42,-13.32,17.62,3.74,19.98,12.77,7.24,7.36,19.98,82.36,101.1,154.9,0.95,0.5975,0,0.3525,0
163,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Global Equity Fund,BOCIP,Equity Fund - Global Equity Fund,15-04-2003,"10,247.35",6,1.67957,15.06,19.93,-17.89,18.08,14.41,19.93,13.28,9.69,7.97,19.93,86.58,152.15,464.56,1.5975,0.5975,0,1,0
164,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Growth Fund,BOCIP,Mixed Assets Fund - 81% to 100% Equity,13-12-2000,"15,783.32",5,1.68152,10.48,7.56,-16.06,4.54,12.17,22.83,8.59,6.69,5.14,22.83,50.98,91.15,248.69,1.5975,0.5975,0,1,0
165,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Hong Kong Equity Fund,BOCIP,Equity Fund - Hong Kong Equity Fund,15-04-2003,"12,558.21",7,1.67216,17.33,-12.64,-17.19,-15.5,11.42,33.57,1.58,3.58,7.29,33.57,8.17,42.21,388.8,1.5975,0.5975,0,1,0
166,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Hong Kong Stable Retirement Fund,BOCIP,Mixed Assets Fund - Uncategorized Mixed Asset Fund,21-11-2022,616.9,n.a.,1.4133,4.76,6.57,n.a.,n.a.,n.a.,6.65,n.a.,n.a.,6.07,6.65,n.a.,n.a.,18.95,1.26,0.5975,0,0.6625,0
167,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Japan Equity Fund,BOCIP,Equity Fund - Japan Equity Fund,3/10/06,"1,505.87",5,1.66729,11.31,21.74,-13,3.14,7.21,24.67,11.37,5.5,2.11,24.67,71.36,70.73,48.87,1.5975,0.5975,0,1,0
168,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential MPF Conservative Fund,BOCIP,Money Market Fund - MPF Conservative Fund,13-12-2000,"14,724.93",1,0.8144,3.82,3.74,0.55,0,0.88,2.48,2,1.37,1.17,2.48,10.39,14.53,33.48,0.76,0.51,0,0.25,0
169,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential MPF RMB & HKD Money Market Fund,BOCIP,Money Market Fund - Other than MPF Conservative Fund,2/4/13,"1,325.27",3,0.5605,1.02,1.43,-2.75,3.25,6.19,2.15,1.68,1.67,1.54,2.15,8.69,17.97,21.23,0.76,0.51,0,0.25,0
170,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential North America Index Tracking Fund,BOCIP,Equity Fund - United States Equity Fund,3/9/12,"10,363.78",6,1.02335,21.9,24.3,-20.11,25.56,18.71,19.87,15.41,12.52,12.35,19.87,104.76,225.2,363.58,0.95,0.5975,0,0.3525,0
171,BOC-Prudential Easy-Choice Mandatory Provident Fund Scheme,BOC-Prudential Stable Fund,BOCIP,Mixed Assets Fund - 21% to 40% Equity,13-12-2000,"7,774.26",4,1.66675,0.76,4.71,-16.1,-1.95,9.32,9.55,0.95,1.75,3.1,9.55,4.85,18.98,113.85,1.5975,0.5975,0,1,0
172,China Life MPF Master Trust Scheme,China Life Age 65 Plus Fund,China Life,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,190.29,4,0.81915,3.85,8.47,-15.18,0.66,9.7,7.56,1.35,n.a.,2.49,7.56,6.95,n.a.,23.51,0.75,0.67,0,0.08,0
173,China Life MPF Master Trust Scheme,China Life Balanced Fund,China Life,Mixed Assets Fund - 61% to 80% Equity,1/12/00,485.62,5,1.36763,7.46,4.24,-19.56,0.11,13.73,15.93,3.43,4.33,4.71,15.93,18.37,52.86,214.8,Up to 1.36,0.96,0,Up to 0.4,0
174,China Life MPF Master Trust Scheme,China Life Core Accumulation Fund,China Life,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,420.01,5,0.82106,11.05,16.07,-16.59,9.91,12.56,15.83,8.35,n.a.,7.06,15.83,49.38,n.a.,79.7,0.75,0.67,0,0.08,0
175,China Life MPF Master Trust Scheme,China Life Greater China Equity Fund,China Life,Equity Fund - Greater China Equity Fund,13-12-2021,139.63,7,1.27199,13.11,-9.41,-26.83,n.a.,n.a.,33.31,n.a.,n.a.,0.44,33.31,n.a.,n.a.,1.73,1.15,0.6,0,0.55,0
176,China Life MPF Master Trust Scheme,China Life Growth Fund,China Life,Mixed Assets Fund - 81% to 100% Equity,1/12/00,845.5,5,1.37224,10.28,4.5,-20.63,1.4,14.81,19.08,5.12,5.43,5.33,19.08,28.4,69.77,264.93,Up to 1.36,0.96,0,Up to 0.4,0
177,China Life MPF Master Trust Scheme,China Life Hong Kong Equity Fund,China Life,Equity Fund - Hong Kong Equity Fund,23-12-2011,586.57,7,0.87615,18.04,-15.53,-18.49,-15.68,18.1,31,0.97,4.34,4.65,31,4.97,52.93,87.74,Up to 0.9,0.5,0,Up to 0.4,0
178,China Life MPF Master Trust Scheme,China Life Joyful Retirement Guaranteed Fund,China Life,Guaranteed Fund,1/10/07,"1,449.33",4,2.06681,3.57,3.51,-9.7,-2.5,1.98,5.8,0.02,1.32,2.34,5.8,0.12,14.05,52.01,1.06,0.86,0,0.2,0.8
179,China Life MPF Master Trust Scheme,China Life MPF Conservative Fund,China Life,Money Market Fund - MPF Conservative Fund,1/12/00,598.19,1,0.90091,3.43,3.2,0.32,0,0.65,2.4,1.75,1.1,0.73,2.4,9.09,11.58,20,0.85,0.75,0,0.1,0
180,China Life MPF Master Trust Scheme,China Life Retire-Easy Global Equity Fund,China Life,Equity Fund - Global Equity Fund,1/10/07,361.42,5,1.25177,15.79,34.98,-21.57,0.47,9.45,17.32,10.45,7.48,3.8,17.32,64.42,105.87,96.4,Up to 1.4,0.9,0,Up to 0.5,0
181,China Life MPF Master Trust Scheme,China Life US Equity Fund,China Life,Equity Fund - United States Equity Fund,13-12-2021,252.63,6,0.89316,18.47,34.88,-33.04,n.a.,n.a.,19.34,n.a.,n.a.,5.76,19.34,n.a.,n.a.,24.31,Up to 0.83,0.68,0,Up to 0.15,0
182,Fidelity Retirement Master Trust,Age 65 Plus Fund,HSBC,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,"1,000.29",4,0.80442,3.42,7.28,-14.99,0.74,8.15,5.44,0.68,n.a.,2.15,5.44,3.46,n.a.,20.06,Up to 0.75,Up to 0.7,0,Up to 0.1,0
183,Fidelity Retirement Master Trust,Americas Equity Fund,HSBC,Equity Fund - United States Equity Fund,31-08-2023,"2,068.58",n.a.,1.39007,22.75,n.a.,n.a.,n.a.,n.a.,18.02,n.a.,n.a.,19.36,18.02,n.a.,n.a.,46.74,Up to 1.36,Up to 0.61,0.2,0.55,0
184,Fidelity Retirement Master Trust,Asia Pacific Equity Fund,HSBC,Equity Fund - Asia Equity Fund,7/8/06,"5,211.98",5,1.54408,11.43,9.54,-21.62,-3.38,17.45,19.49,4.94,6.77,6.82,19.49,27.25,92.59,255.89,Up to 1.45,Up to 0.7,0,0.75,0
185,Fidelity Retirement Master Trust,Balanced Fund,HSBC,Mixed Assets Fund - 61% to 80% Equity,1/12/00,"4,597.37",5,1.5326,7.26,4.19,-19.62,-0.01,13.69,15.67,3.3,4.26,4.81,15.67,17.61,51.73,222.98,Up to 1.45,Up to 0.7,0,0.75,0
186,Fidelity Retirement Master Trust,Capital Stable Fund,HSBC,Mixed Assets Fund - 21% to 40% Equity,1/12/00,"2,000.55",4,1.52942,2.04,4.16,-17.94,-2.4,10.61,8.09,-0.2,1.83,3.28,8.09,-1.01,19.94,123.49,Up to 1.45,Up to 0.7,0,0.75,0
187,Fidelity Retirement Master Trust,Core Accumulation Fund,HSBC,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"5,105.89",5,0.79169,9.7,14.03,-16.6,9.46,11.96,13.32,7.27,n.a.,6.63,13.32,42.02,n.a.,73.56,Up to 0.75,Up to 0.7,0,Up to 0.1,0
188,Fidelity Retirement Master Trust,European Equity Fund,HSBC,Equity Fund - Europe Equity Fund,31-08-2023,191.02,n.a.,1.42899,-0.34,n.a.,n.a.,n.a.,n.a.,9.73,n.a.,n.a.,8.86,9.73,n.a.,n.a.,20.2,Up to 1.36,Up to 0.61,0.2,0.55,0
189,Fidelity Retirement Master Trust,Fidelity Hong Kong Tracker Fund,HSBC,Equity Fund - Hong Kong Equity Fund (Index Tracking),28-06-2013,"2,488.11",7,0.74853,21.69,-11.08,-13.21,-12.52,-1.56,30.42,4.04,3.89,3.88,30.42,21.87,46.41,60.04,Up to 0.69,Up to 0.645,0,Up to 0.045,0
190,Fidelity Retirement Master Trust,Fidelity SaveEasy 2025 Fund,HSBC,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,387.82,5,1.31493,4.33,4.32,-20.04,0.99,14.01,9.7,1.96,3.93,6.74,9.7,10.2,47.04,203.41,Up to 1.45,Up to 0.7,0,0.75,0
191,Fidelity Retirement Master Trust,Fidelity SaveEasy 2030 Fund,HSBC,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,631.76,5,1.5645,9.55,4.39,-20.58,1.1,14.57,17.95,4.75,5.37,7.64,17.95,26.1,68.66,250.02,Up to 1.45,Up to 0.7,0,0.75,0
192,Fidelity Retirement Master Trust,Fidelity SaveEasy 2035 Fund,HSBC,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,671.76,6,1.56536,10.5,4.32,-20.88,1.22,14.9,19.31,5.23,5.6,7.8,19.31,29.04,72.47,259.18,Up to 1.45,Up to 0.7,0,0.75,0
193,Fidelity Retirement Master Trust,Fidelity SaveEasy 2040 Fund,HSBC,Mixed Assets Fund - Uncategorized Mixed Asset Fund,27-10-2008,"1,615.14",6,1.55239,10.97,4.41,-20.93,1.31,14.91,20.46,5.57,5.78,7.98,20.46,31.12,75.32,269.4,Up to 1.45,Up to 0.7,0,0.75,0
194,Fidelity Retirement Master Trust,Fidelity SaveEasy 2045 Fund,HSBC,Mixed Assets Fund - Uncategorized Mixed Asset Fund,23-11-2015,293.8,6,1.65651,10.76,4.41,-21.02,1.06,14.54,20.34,5.41,n.a.,5.64,20.34,30.13,n.a.,72.54,Up to 1.45,Up to 0.7,0,0.75,0
195,Fidelity Retirement Master Trust,Fidelity SaveEasy 2050 Fund,HSBC,Mixed Assets Fund - Uncategorized Mixed Asset Fund,23-11-2015,621.43,6,1.61082,10.89,4.31,-21.09,1.03,14.53,20.95,5.5,n.a.,5.53,20.95,30.69,n.a.,70.75,Up to 1.45,Up to 0.7,0,0.75,0
196,Fidelity Retirement Master Trust,Global Equity Fund,HSBC,Equity Fund - Global Equity Fund,2/7/03,"8,855.16",5,1.51111,15.28,18.21,-23.83,15.76,12.8,17.57,9.92,7.89,7.12,17.57,60.49,113.68,365.56,Up to 1.45,Up to 0.7,0,0.75,0
197,Fidelity Retirement Master Trust,Growth Fund,HSBC,Mixed Assets Fund - 81% to 100% Equity,1/12/00,"7,878.02",5,1.5362,10.05,4.46,-20.72,1.35,14.71,18.87,5,5.37,5.39,18.87,27.62,68.65,269.86,Up to 1.45,Up to 0.7,0,0.75,0
198,Fidelity Retirement Master Trust,Hong Kong Bond Fund,HSBC,Bond Fund - Hong Kong Dollar Bond Fund,8/7/03,"1,276.93",3,1.25571,3.29,6.56,-10.26,-0.77,5.59,4.6,0.75,1.59,1.59,4.6,3.82,17.12,42.18,Up to 1.2,Up to 0.7,0,0.6,0
199,Fidelity Retirement Master Trust,Hong Kong Equity Fund,HSBC,Equity Fund - Hong Kong Equity Fund,1/12/00,"7,480.65",7,1.5206,16.83,-16.18,-19.03,-15.94,17.41,30.47,0.35,3.7,5.53,30.47,1.78,43.79,282.6,Up to 1.45,Up to 0.7,0,0.75,0
200,Fidelity Retirement Master Trust,MPF Conservative Fund,HSBC,Money Market Fund - MPF Conservative Fund,1/12/00,"6,952.02",1,0.97277,3.55,3.03,0.08,0,0.29,2.25,1.67,0.96,0.78,2.25,8.61,10,21.33,0.93,0.68,0,0.25,0
201,Fidelity Retirement Master Trust,RetireEasy Fund,HSBC,Mixed Assets Fund - Uncategorized Mixed Asset Fund,1/11/21,331.43,4,1.30567,5.17,8,-18.92,n.a.,n.a.,9.31,n.a.,n.a.,0.01,9.31,n.a.,n.a.,0.05,Up to 1.2,Up to 0.5,0.2,0.5,0
202,Fidelity Retirement Master Trust,RMB Bond Fund,HSBC,Bond Fund - RMB Bond Fund,16-05-2016,537.3,3,1.32258,1,1.42,-7.71,1.51,6.09,3.05,0.55,n.a.,1.23,3.05,2.78,n.a.,12.29,Up to 1.2,Up to 0.7,0,0.6,0
203,Fidelity Retirement Master Trust,Stable Growth Fund,HSBC,Mixed Assets Fund - 41% to 60% Equity,1/12/00,"4,005.30",5,1.52523,4.32,4.26,-19.07,-1.25,12.51,11.92,1.46,3.07,4.13,11.92,7.51,35.28,174.27,Up to 1.45,Up to 0.7,0,0.75,0
204,Fidelity Retirement Master Trust,World Bond Fund,HSBC,Bond Fund - Global Bond Fund,8/7/03,"1,446.60",4,1.5043,-3.65,4.3,-18.21,-5.34,9.32,2.82,-3.66,-0.25,1.25,2.82,-17.01,-2.44,31.98,Up to 1.3,Up to 0.7,0,0.6,0
205,Haitong MPF Retirement Fund,Haitong Age 65 Plus Fund - Class A,HSBC,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,5.28,4,0.93468,6.27,9.02,-15.42,1.88,11.29,10,2.69,n.a.,3.49,10,14.21,n.a.,34.2,0.745,0.375,0,0.37,0
206,Haitong MPF Retirement Fund,Haitong Age 65 Plus Fund - Class T,HSBC,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,5.13,4,0.93437,6.27,9.02,-15.42,1.88,11.29,10,2.69,n.a.,3.49,10,14.21,n.a.,34.2,0.745,0.375,0,0.37,0
207,Haitong MPF Retirement Fund,Haitong Asia Pacific Fund - Class A,HSBC,Equity Fund - Asia Equity Fund,1/2/01,18.36,5,1.98182,13.26,2.77,-22.73,0.86,16.45,27.55,7.28,3.02,3.71,27.55,42.12,34.59,146.3,1.14,0.45,0,0.69,0
208,Haitong MPF Retirement Fund,Haitong Asia Pacific Fund - Class T,HSBC,Equity Fund - Asia Equity Fund,1/2/01,39.23,5,1.9321,13.37,2.79,-22.7,0.92,16.49,27.61,7.33,3.06,4.3,27.61,42.43,35.23,183.3,1.09,0.4,0,0.69,0
209,Haitong MPF Retirement Fund,Haitong Core Accumulation Fund - Class A,HSBC,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,41.5,5,0.91673,15.52,15.83,-21.34,11.59,19.13,21.61,9.45,n.a.,8.58,21.61,57.05,n.a.,102.6,0.745,0.375,0,0.37,0
210,Haitong MPF Retirement Fund,Haitong Core Accumulation Fund - Class T,HSBC,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,33.79,5,0.91667,15.55,15.8,-21.32,11.58,19.08,21.57,9.45,n.a.,8.66,21.57,57.04,n.a.,104,0.745,0.375,0,0.37,0
211,Haitong MPF Retirement Fund,Haitong Global Diversification Fund - Class A,HSBC,Equity Fund - Global Equity Fund,1/2/01,68.2,6,1.42441,23.51,21.71,-27.37,20.65,25.89,30.43,14.72,11.96,5.69,30.43,98.74,209.36,293.5,0.92,0.55,0,0.37,0
212,Haitong MPF Retirement Fund,Haitong Global Diversification Fund - Class T,HSBC,Equity Fund - Global Equity Fund,1/2/01,116.62,6,1.32417,23.64,21.77,-27.26,20.79,26.01,30.51,14.83,12.07,6.26,30.51,99.69,212.53,349.1,0.82,0.45,0,0.37,0
213,Haitong MPF Retirement Fund,Haitong Hong Kong SAR Fund - Class A,HSBC,Equity Fund - Hong Kong Equity Fund,1/2/01,66.51,7,1.83253,14.98,-16.33,-15.72,-9.05,34.4,34.45,2.93,6.44,8.93,34.45,15.55,86.68,731.3,1.26,0.55,0,0.71,0
214,Haitong MPF Retirement Fund,Haitong Hong Kong SAR Fund - Class T,HSBC,Equity Fund - Hong Kong Equity Fund,1/2/01,161.34,7,1.7523,15.09,-16.27,-15.65,-8.98,34.52,34.54,3.01,6.53,9.41,34.54,16.01,88.18,826.2,1.18,0.47,0,0.71,0
215,Haitong MPF Retirement Fund,Haitong Korea Fund - Class A,HSBC,Equity Fund - Uncategorized Equity Fund,1/2/01,7.61,6,1.84038,-8.23,16.69,-24.3,-1.65,30.42,74.89,13.14,3.78,6.46,74.89,85.35,44.91,370.8,0.72,0.4,0,0.32,0
216,Haitong MPF Retirement Fund,Haitong Korea Fund - Class T,HSBC,Equity Fund - Uncategorized Equity Fund,1/2/01,25.55,6,1.84082,-8.21,16.68,-24.29,-1.65,30.4,74.88,13.13,3.78,6.87,74.88,85.33,44.9,418,0.72,0.4,0,0.32,0
217,Haitong MPF Retirement Fund,Haitong MPF Conservative Fund - Class A,HSBC,Money Market Fund - MPF Conservative Fund,1/2/01,32.03,1,0.90589,3.58,3.53,0.27,0.09,0.62,2.32,1.84,1.22,0.86,2.32,9.57,12.86,23.7,0.8,0.4,0,0.4,0
218,Haitong MPF Retirement Fund,Haitong MPF Conservative Fund - Class T,HSBC,Money Market Fund - MPF Conservative Fund,1/2/01,67.44,1,0.85623,3.6,3.55,0.43,0,0.79,2.44,1.88,1.26,0.94,2.44,9.74,13.39,26.2,0.75,0.35,0,0.4,0
219,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Age 65 Plus Fund,HSBC,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,8/10/09,"2,153.51",4,0.77844,2.56,7.15,-13.21,1.39,9.02,6.21,1.38,2.52,2.13,6.21,7.1,28.24,40.3,0.75,0.464,0.076,0.21,0
220,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Asia Pacific Equity Fund,HSBC,Equity Fund - Asia Equity Fund,1/12/00,"4,306.46",6,1.50289,8.43,-1.28,-25.41,-0.49,22.1,16.31,3.24,5.04,5.5,16.31,17.28,63.58,280,1.45,0.659,0.086,0.705,0
221,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Balanced Fund,HSBC,Mixed Assets Fund - 61% to 80% Equity,1/12/00,"6,439.85",5,1.42722,7.16,5.51,-14.08,1.21,13.65,18.17,5.75,5.29,4.1,18.17,32.28,67.49,172.5,1.35,0.659,0.086,0.605,0
222,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Chinese Equity Fund,HSBC,Equity Fund - China Equity Fund,8/10/09,"4,008.46",7,1.49495,15.75,-18.15,-25.6,-18.24,33.44,30.33,-2.77,3.4,3.21,30.33,-13.11,39.75,66.3,1.45,0.659,0.086,0.705,0
223,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Core Accumulation Fund,HSBC,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/12/00,"6,924.37",4,0.77643,7.92,14.29,-14.53,11.28,11.85,13.46,7.99,6.37,4.41,13.46,46.87,85.52,193.3,0.75,0.464,0.076,0.21,0
224,Hang Seng Mandatory Provident Fund - SuperTrust Plus,European Equity Fund,HSBC,Equity Fund - Europe Equity Fund,1/12/00,"1,571.74",5,1.34422,-1.57,17.89,-14.76,15.84,3.18,19.41,11.41,5.25,2.87,19.41,71.67,66.86,102.4,1.3,0.659,0.086,0.555,0
225,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Global Bond Fund,HSBC,Bond Fund - Global Bond Fund,8/10/09,"1,802.68",4,0.82723,-2.72,4.49,-15.49,-5.84,9.24,3.91,-2.66,0.44,0.92,3.91,-12.63,4.47,15.86,0.79,0.531,0.076,0.183,0
226,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Global Equity Fund,HSBC,Equity Fund - Global Equity Fund,1/7/19,"1,542.16",5,0.81984,13.97,22.11,-17.28,21.63,12.37,19.81,14.02,n.a.,11.82,19.81,92.81,n.a.,103.07,0.79,0.531,0.076,0.183,0
227,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Growth Fund,HSBC,Mixed Assets Fund - 81% to 100% Equity,1/12/00,"10,101.17",5,1.52584,9.69,5.54,-14.92,2.93,14.85,22.45,7.76,6.42,4.51,22.45,45.31,86.41,200.5,1.45,0.659,0.086,0.705,0
228,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Guaranteed Fund,HSBC,Guaranteed Fund,1/12/00,"3,399.65",3,2.05658,2.61,2.15,-6.77,-2.78,4.26,3.81,-0.11,0.26,0.25,3.81,-0.56,2.61,6.3,1.275,0.682,0.088,0.505,0.75
229,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Hang Seng China Enterprises Index Tracking Fund,HSBC,Equity Fund - China Equity Fund,1/7/19,"1,843.76",7,0.88854,29.67,-11.71,-16.47,-21.99,-1.29,28.57,1.01,n.a.,-0.34,28.57,5.18,n.a.,-2.15,Up to 0.79,Up to 0.537,0.075,0.178,0
230,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Hang Seng Index Tracking Fund,HSBC,Equity Fund - Hong Kong Equity Fund (Index Tracking),1/12/00,"14,167.96",7,0.78561,21.41,-11.29,-13.1,-12.59,-1.14,30.63,4.08,3.98,4.53,30.63,22.16,47.72,201.5,Up to 0.73,0.517,0.075,Up to 0.138,0
231,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Hong Kong and Chinese Equity Fund,HSBC,Equity Fund - Hong Kong Equity Fund,1/12/00,"5,439.85",7,1.49059,15.11,-14.46,-16.34,-14.49,15.91,32.48,1.05,3.53,4.15,32.48,5.39,41.46,175.7,1.45,0.659,0.086,0.705,0
232,Hang Seng Mandatory Provident Fund - SuperTrust Plus,MPF Conservative Fund,HSBC,Money Market Fund - MPF Conservative Fund,1/12/00,"13,307.50",1,0.77059,3.81,3.72,0.39,0,0.47,2.61,1.97,1.17,1.32,2.61,10.27,12.37,38.73,0.75,0.531,0.076,0.143,0
233,Hang Seng Mandatory Provident Fund - SuperTrust Plus,North American Equity Fund,HSBC,Equity Fund - United States Equity Fund,1/12/00,"5,899.41",6,1.3225,21.31,23.42,-19.04,26.42,17.05,16.84,14.87,11.91,5.46,16.84,100.05,208.52,276.7,1.3,0.659,0.086,0.555,0
234,Hang Seng Mandatory Provident Fund - SuperTrust Plus,Stable Fund,HSBC,Mixed Assets Fund - 21% to 40% Equity,8/10/09,"1,439.78",4,1.32713,1.57,4.32,-14.03,-2.6,11.17,9.25,1,2.3,1.92,9.25,5.11,25.51,35.8,1.25,0.659,0.086,0.505,0
235,Hang Seng Mandatory Provident Fund - SuperTrust Plus,ValueChoice Asia Pacific Equity Tracker Fund,HSBC,Equity Fund - Asia Equity Fund,1/7/19,674.85,6,0.87896,10.5,5.8,-16.54,-0.48,17.1,24.16,7.91,n.a.,6.94,24.16,46.36,n.a.,53.05,0.79,0.531,0.076,0.183,0
236,Hang Seng Mandatory Provident Fund - SuperTrust Plus,ValueChoice Balanced Fund,HSBC,Mixed Assets Fund - 61% to 80% Equity,1/7/19,420.56,5,0.92876,8.32,6.89,-15.16,1.11,13.8,19.08,6.02,n.a.,5.8,19.08,33.95,n.a.,42.93,0.79,0.531,0.076,0.183,0
237,Hang Seng Mandatory Provident Fund - SuperTrust Plus,ValueChoice Europe Equity Tracker Fund,HSBC,Equity Fund - Europe Equity Fund,1/7/19,748.14,5,0.88059,3.28,17.59,-13.68,17.44,3.15,20.08,13.04,n.a.,8.49,20.08,84.64,n.a.,67.65,0.79,0.531,0.076,0.183,0
238,Hang Seng Mandatory Provident Fund - SuperTrust Plus,ValueChoice North America Equity Tracker Fund,HSBC,Equity Fund - United States Equity Fund,1/7/19,"4,291.24",6,0.82426,22.4,24.33,-19.81,27.11,16.73,20.06,15.49,n.a.,14.19,20.06,105.57,n.a.,131.98,0.79,0.531,0.076,0.183,0
239,HSBC Mandatory Provident Fund - SuperTrust Plus,Age 65 Plus Fund,HSBC,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,8/10/09,"9,803.66",4,0.77755,2.56,7.15,-13.21,1.39,9.02,6.21,1.38,2.52,2.13,6.21,7.1,28.24,40.3,0.75,0.464,0.076,0.21,0
240,HSBC Mandatory Provident Fund - SuperTrust Plus,Asia Pacific Equity Fund,HSBC,Equity Fund - Asia Equity Fund,1/12/00,"9,647.03",6,1.50276,8.43,-1.28,-25.41,-0.49,22.1,16.31,3.24,5.04,5.5,16.31,17.28,63.58,280,1.45,0.659,0.086,0.705,0
241,HSBC Mandatory Provident Fund - SuperTrust Plus,Balanced Fund,HSBC,Mixed Assets Fund - 61% to 80% Equity,1/12/00,"20,428.80",5,1.42708,7.16,5.51,-14.08,1.21,13.65,18.17,5.75,5.29,4.1,18.17,32.28,67.49,172.5,1.35,0.659,0.086,0.605,0
242,HSBC Mandatory Provident Fund - SuperTrust Plus,Chinese Equity Fund,HSBC,Equity Fund - China Equity Fund,8/10/09,"9,085.60",7,1.49482,15.75,-18.15,-25.6,-18.24,33.44,30.33,-2.77,3.4,3.21,30.33,-13.11,39.75,66.3,1.45,0.659,0.086,0.705,0
243,HSBC Mandatory Provident Fund - SuperTrust Plus,Core Accumulation Fund,HSBC,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/12/00,"28,253.21",4,0.77621,7.92,14.29,-14.53,11.28,11.85,13.46,7.99,6.37,4.41,13.46,46.87,85.52,193.3,0.75,0.464,0.076,0.21,0
244,HSBC Mandatory Provident Fund - SuperTrust Plus,European Equity Fund,HSBC,Equity Fund - Europe Equity Fund,1/12/00,"4,444.97",5,1.3436,-1.57,17.89,-14.76,15.84,3.18,19.41,11.41,5.25,2.87,19.41,71.67,66.86,102.4,1.3,0.659,0.086,0.555,0
245,HSBC Mandatory Provident Fund - SuperTrust Plus,Global Bond Fund,HSBC,Bond Fund - Global Bond Fund,8/10/09,"6,630.03",4,0.82644,-2.72,4.49,-15.49,-5.84,9.24,3.91,-2.66,0.44,0.92,3.91,-12.63,4.47,15.86,0.79,0.531,0.076,0.183,0
246,HSBC Mandatory Provident Fund - SuperTrust Plus,Global Equity Fund,HSBC,Equity Fund - Global Equity Fund,1/7/19,"6,767.19",5,0.82007,13.97,22.11,-17.28,21.63,12.37,19.81,14.02,n.a.,11.82,19.81,92.81,n.a.,103.07,0.79,0.531,0.076,0.183,0
247,HSBC Mandatory Provident Fund - SuperTrust Plus,Growth Fund,HSBC,Mixed Assets Fund - 81% to 100% Equity,1/12/00,"30,742.82",5,1.52578,9.69,5.54,-14.92,2.93,14.85,22.45,7.76,6.42,4.51,22.45,45.31,86.41,200.5,1.45,0.659,0.086,0.705,0
248,HSBC Mandatory Provident Fund - SuperTrust Plus,Guaranteed Fund,HSBC,Guaranteed Fund,1/12/00,"11,031.37",3,2.05659,2.61,2.15,-6.77,-2.78,4.26,3.81,-0.11,0.26,0.25,3.81,-0.56,2.61,6.3,1.275,0.682,0.088,0.505,0.75
249,HSBC Mandatory Provident Fund - SuperTrust Plus,Hang Seng China Enterprises Index Tracking Fund,HSBC,Equity Fund - China Equity Fund,1/7/19,"4,712.22",7,0.88878,29.67,-11.71,-16.47,-21.99,-1.29,28.57,1.01,n.a.,-0.34,28.57,5.18,n.a.,-2.15,Up to 0.79,Up to 0.537,0.075,0.178,0
250,HSBC Mandatory Provident Fund - SuperTrust Plus,Hang Seng Index Tracking Fund,HSBC,Equity Fund - Hong Kong Equity Fund (Index Tracking),1/12/00,"36,232.41",7,0.78564,21.41,-11.29,-13.1,-12.59,-1.14,30.63,4.08,3.98,4.53,30.63,22.16,47.72,201.5,Up to 0.73,0.517,0.075,Up to 0.138,0
251,HSBC Mandatory Provident Fund - SuperTrust Plus,Hong Kong and Chinese Equity Fund,HSBC,Equity Fund - Hong Kong Equity Fund,1/12/00,"12,026.59",7,1.49048,15.11,-14.46,-16.34,-14.49,15.91,32.48,1.05,3.53,4.15,32.48,5.39,41.46,175.7,1.45,0.659,0.086,0.705,0
252,HSBC Mandatory Provident Fund - SuperTrust Plus,MPF Conservative Fund,HSBC,Money Market Fund - MPF Conservative Fund,1/12/00,"39,519.44",1,0.7705,3.81,3.72,0.39,0,0.47,2.61,1.97,1.17,1.32,2.61,10.27,12.37,38.73,0.75,0.531,0.076,0.143,0
253,HSBC Mandatory Provident Fund - SuperTrust Plus,North American Equity Fund,HSBC,Equity Fund - United States Equity Fund,1/12/00,"19,508.31",6,1.32225,21.31,23.42,-19.04,26.42,17.05,16.84,14.87,11.91,5.46,16.84,100.05,208.52,276.7,1.3,0.659,0.086,0.555,0
254,HSBC Mandatory Provident Fund - SuperTrust Plus,Stable Fund,HSBC,Mixed Assets Fund - 21% to 40% Equity,8/10/09,"4,953.41",4,1.326,1.57,4.32,-14.03,-2.6,11.17,9.25,1,2.3,1.92,9.25,5.11,25.51,35.8,1.25,0.659,0.086,0.505,0
255,HSBC Mandatory Provident Fund - SuperTrust Plus,ValueChoice Asia Pacific Equity Tracker Fund,HSBC,Equity Fund - Asia Equity Fund,1/7/19,"2,708.34",6,0.87936,10.5,5.8,-16.54,-0.48,17.1,24.16,7.91,n.a.,6.94,24.16,46.36,n.a.,53.05,0.79,0.531,0.076,0.183,0
256,HSBC Mandatory Provident Fund - SuperTrust Plus,ValueChoice Balanced Fund,HSBC,Mixed Assets Fund - 61% to 80% Equity,1/7/19,"1,922.49",5,0.92876,8.32,6.89,-15.16,1.11,13.8,19.08,6.02,n.a.,5.8,19.08,33.95,n.a.,42.93,0.79,0.531,0.076,0.183,0
257,HSBC Mandatory Provident Fund - SuperTrust Plus,ValueChoice Europe Equity Tracker Fund,HSBC,Equity Fund - Europe Equity Fund,1/7/19,"2,638.76",5,0.88055,3.28,17.59,-13.68,17.44,3.15,20.08,13.04,n.a.,8.49,20.08,84.64,n.a.,67.65,0.79,0.531,0.076,0.183,0
258,HSBC Mandatory Provident Fund - SuperTrust Plus,ValueChoice North America Equity Tracker Fund,HSBC,Equity Fund - United States Equity Fund,1/7/19,"16,811.11",6,0.82394,22.4,24.33,-19.81,27.11,16.73,20.06,15.49,n.a.,14.19,20.06,105.57,n.a.,131.98,0.79,0.531,0.076,0.183,0
259,Manulife Global Select (MPF) Scheme,Manulife MPF 2025 Retirement Fund,Manulife,Mixed Assets Fund - Uncategorized Mixed Asset Fund,21-02-2011,791.67,5,1.07324,7.17,5.74,-19.25,1.84,13.7,11.81,3.04,3.94,3.57,11.81,16.15,47.16,67.5,0.99,0.62,Up to 0.12,Up to 0.6,0
260,Manulife Global Select (MPF) Scheme,Manulife MPF 2030 Retirement Fund,Manulife,Mixed Assets Fund - Uncategorized Mixed Asset Fund,21-02-2011,"1,357.67",5,1.06336,9.42,7.42,-21.24,3.57,16.39,15.97,4.84,5.21,4.5,15.97,26.63,66.25,90.81,0.99,0.62,Up to 0.12,Up to 0.6,0
261,Manulife Global Select (MPF) Scheme,Manulife MPF 2035 Retirement Fund,Manulife,Mixed Assets Fund - Uncategorized Mixed Asset Fund,21-02-2011,"1,531.39",5,1.05835,11.15,7.88,-22.23,4.63,17.6,18.82,5.94,5.89,5,18.82,33.46,77.28,104.64,0.99,0.62,Up to 0.12,Up to 0.6,0
262,Manulife Global Select (MPF) Scheme,Manulife MPF 2040 Retirement Fund,Manulife,Mixed Assets Fund - Uncategorized Mixed Asset Fund,21-02-2011,"1,314.97",6,1.06596,13.08,7.68,-22.81,5.1,18,21.65,6.75,6.34,5.29,21.65,38.64,84.83,113.24,0.99,0.62,Up to 0.12,Up to 0.6,0
263,Manulife Global Select (MPF) Scheme,Manulife MPF 2045 Retirement Fund,Manulife,Mixed Assets Fund - Uncategorized Mixed Asset Fund,21-02-2011,"2,252.42",6,1.04687,13.04,7.76,-22.74,5.26,18.11,21.86,6.87,6.43,5.37,21.86,39.44,86.46,115.71,0.99,0.62,Up to 0.12,Up to 0.6,0
264,Manulife Global Select (MPF) Scheme,Manulife MPF Age 65 Plus Fund,Manulife,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,"8,198.94",4,0.7564,3.09,7.16,-14.74,1.05,8.29,5.99,0.84,n.a.,2.34,5.99,4.26,n.a.,22,0.75,0.49,0,0.26,0
265,Manulife Global Select (MPF) Scheme,Manulife MPF Aggressive Fund,Manulife,Mixed Assets Fund - 81% to 100% Equity,1/12/00,"28,984.42",6,1.79078,9.61,8,-23.47,4.31,17.27,18.8,5.38,5.5,4.15,18.8,29.95,70.78,175.28,1.75,0.76,Up to 0.74,Up to 0.6,0
266,Manulife Global Select (MPF) Scheme,Manulife MPF China Value Fund,Manulife,Equity Fund - Greater China Equity Fund,1/2/06,"32,429.49",7,1.97021,13.34,-8.09,-27.77,-10.44,22.67,35.89,0.73,4.51,6.07,35.89,3.7,55.47,220.23,1.9,0.76,Up to 0.89,Up to 0.7,0
267,Manulife Global Select (MPF) Scheme,Manulife MPF Conservative Fund,Manulife,Money Market Fund - MPF Conservative Fund,1/12/00,"22,147.81",1,0.7679,3.76,3.78,0.51,0.01,0.85,2.5,2,1.34,0.91,2.5,10.39,14.27,25.21,0.75,0.5,0,0.25,0
268,Manulife Global Select (MPF) Scheme,Manulife MPF Core Accumulation Fund,Manulife,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,"31,430.89",5,0.75345,9.63,14.23,-16.16,9.79,12.17,13.89,7.55,n.a.,6.89,13.89,43.87,n.a.,77.09,0.75,0.49,0,0.26,0
269,Manulife Global Select (MPF) Scheme,Manulife MPF European Equity Fund,Manulife,Equity Fund - Europe Equity Fund,1/12/00,"6,994.07",6,1.78999,-2.81,23.66,-31.12,27.29,22.23,7.07,6.44,5.84,2.23,7.07,36.65,76.37,73.04,1.75,0.76,0.74,0.25,0
270,Manulife Global Select (MPF) Scheme,Manulife MPF Fidelity Growth Fund,Manulife,Mixed Assets Fund - 81% to 100% Equity,1/9/03,"11,280.80",6,1.7974,9.7,4.16,-20.9,1.04,14.44,18.49,4.7,5.01,6.24,18.49,25.81,63.11,282.84,1.75,Up to 0.86,Up to 0.26,0.73,0
271,Manulife Global Select (MPF) Scheme,Manulife MPF Fidelity Stable Growth Fund,Manulife,Mixed Assets Fund - 41% to 60% Equity,1/9/03,"7,763.98",5,1.79073,3.99,3.96,-19.26,-1.57,12.21,11.55,1.16,2.72,4.16,11.55,5.94,30.79,146.86,1.75,Up to 0.86,Up to 0.26,0.73,0
272,Manulife Global Select (MPF) Scheme,Manulife MPF Growth Fund,Manulife,Mixed Assets Fund - 61% to 80% Equity,1/12/00,"21,523.47",5,1.78402,7.24,6.29,-21.44,2.38,15.14,15.44,3.68,4.18,3.78,15.44,19.79,50.66,151.88,1.75,0.76,Up to 0.74,Up to 0.6,0
273,Manulife Global Select (MPF) Scheme,Manulife MPF Hang Seng Index ESG Fund,Manulife,Equity Fund - Hong Kong Equity Fund (Index Tracking),23-04-2012,"9,141.35",7,0.92494,11.13,-13.34,-13.21,-12.64,-1.59,31.26,1.9,2.77,3.45,31.26,9.86,31.45,58.08,0.88,0.72,Up to 0.01,0.15,0
274,Manulife Global Select (MPF) Scheme,Manulife MPF Healthcare Fund,Manulife,Equity Fund - Uncategorized Equity Fund,2/4/08,"47,761.51",5,1.91298,-1.55,3.95,-6.06,18.86,7.25,1.99,6.75,5.09,6.7,1.99,38.62,64.33,212.58,1.9,0.76,Up to 0.84,Up to 0.6,0
275,Manulife Global Select (MPF) Scheme,Manulife MPF Hong Kong Bond Fund,Manulife,Bond Fund - Hong Kong Dollar Bond Fund,1/12/00,"3,782.77",3,1.1772,2.6,5.65,-9.46,-1.54,6.99,4.95,0.58,1.65,1.89,4.95,2.92,17.76,59.48,1.15,0.72,0.18,0.25,0
276,Manulife Global Select (MPF) Scheme,Manulife MPF Hong Kong Equity Fund,Manulife,Equity Fund - Hong Kong Equity Fund,1/12/00,"21,318.93",7,1.77859,14.12,-14.97,-22.39,-15.79,21.11,30.01,-1.04,3.06,3.71,30.01,-5.11,35.17,148.08,1.75,0.76,Up to 0.74,Up to 0.4,0
277,Manulife Global Select (MPF) Scheme,Manulife MPF Interest Fund,Manulife,Guaranteed Fund,1/12/00,"37,874.29",1,1.76663,0.88,0.76,0.37,0.5,0.5,0.88,0.66,0.48,0.65,0.88,3.37,4.95,17.64,1.75,0.76,0.74,0.25,0
278,Manulife Global Select (MPF) Scheme,Manulife MPF International Bond Fund,Manulife,Bond Fund - Global Bond Fund,1/12/00,"7,112.47",4,1.17063,-2.83,5.03,-16.11,-5.05,7.36,3.86,-2.61,-0.35,1.8,3.86,-12.38,-3.45,56.03,1.15,0.72,0.18,0.25,0
279,Manulife Global Select (MPF) Scheme,Manulife MPF International Equity Fund,Manulife,Equity Fund - Global Equity Fund,1/12/00,"14,277.73",6,1.77353,15.06,26.51,-28.29,16.98,19.6,14.6,9.82,8.34,4.28,14.6,59.75,122.88,184.46,1.75,0.76,Up to 0.74,Up to 0.6,0
280,Manulife Global Select (MPF) Scheme,Manulife MPF Japan Equity Fund,Manulife,Equity Fund - Japan Equity Fund,1/12/00,"9,264.74",5,1.764,21.29,24.82,-11.3,9.64,4.61,23.31,14.38,8.76,3.7,23.31,95.78,131.53,147.48,1.75,0.76,0.74,0.25,0
281,Manulife Global Select (MPF) Scheme,Manulife MPF North American Equity Fund,Manulife,Equity Fund - United States Equity Fund,1/12/00,"41,437.95",6,1.76261,21.23,38.69,-31.94,23.04,26.1,14.62,12.54,10.58,5.3,14.62,80.52,173.31,262.05,1.75,0.76,Up to 0.74,Up to 0.375,0
282,Manulife Global Select (MPF) Scheme,Manulife MPF Pacific Asia Equity Fund,Manulife,Equity Fund - Asia Equity Fund,1/12/00,"16,032.98",6,1.81569,11.8,5.55,-17.17,1.06,23.16,20.27,7.65,7.62,5.6,20.27,44.57,108.32,289.15,1.75,0.76,Up to 0.74,Up to 0.4,0
283,Manulife Global Select (MPF) Scheme,Manulife MPF Retirement Income Fund,Manulife,Mixed Assets Fund - Uncategorized Mixed Asset Fund,21-09-2020,"2,114.95",4,1.35156,0.19,1.01,-19.68,-2.22,n.a.,5.17,-1.62,n.a.,-1.59,5.17,-7.84,n.a.,-7.85,1.3,0.72,Up to 0.33,Up to 0.6,0
284,Manulife Global Select (MPF) Scheme,Manulife MPF RMB Bond Fund,Manulife,Bond Fund - RMB Bond Fund,16-12-2013,"2,629.72",3,1.19991,1.37,2.59,-6.01,2.81,7.81,3.67,1.7,1.99,1.64,3.67,8.81,21.78,21.31,1.15,0.72,0.18,0.25,0
285,Manulife Global Select (MPF) Scheme,Manulife MPF Smart Retirement Fund,Manulife,Mixed Assets Fund - 41% to 60% Equity,21-02-2011,"1,312.33",5,1.06214,6.06,6,-18.74,1.41,12.97,11.42,2.65,3.31,2.73,11.42,14,38.56,48.56,0.99,0.62,Up to 0.12,Up to 0.6,0
286,Manulife Global Select (MPF) Scheme,Manulife MPF Stable Fund,Manulife,Guaranteed Fund,1/12/00,"17,935.14",4,1.77276,4.64,4.21,-15.23,-1.72,9.03,8.88,0.9,1.95,2.2,8.88,4.57,21.24,71.9,1.75,0.76,Up to 0.74,Up to 0.6,0
287,Manulife Global Select (MPF) Scheme,Manulife MPF Sustainable Pacific Asia Bond Fund,Manulife,Bond Fund - Asia Bond Fund,23-04-2012,"1,796.81",4,1.19787,1.9,3.2,-10.91,-2.7,9.98,5.49,0.19,1.85,1.4,5.49,0.98,20.09,20.75,1.15,0.72,0.18,0.25,0
288,Manulife RetireChoice (MPF) Scheme,Allianz Asian Fund - Class A,BCT,Equity Fund - Asia Equity Fund,31-08-2004,46.72,6,1.44213,3.33,2.59,-21.06,-8.9,45.78,26.64,2.55,6.72,7.95,26.64,13.4,91.63,405.4,Up to 1.38,Up to 0.53,0.2,0.65,0
289,Manulife RetireChoice (MPF) Scheme,Allianz Asian Fund - Class B,BCT,Equity Fund - Asia Equity Fund,4/8/04,591.83,6,1.24173,3.54,2.79,-20.9,-8.72,46.11,26.9,2.75,7.01,8.41,26.9,14.55,96.81,456.05,Up to 1.18,Up to 0.53,0.2,0.45,0
290,Manulife RetireChoice (MPF) Scheme,Allianz Asian Fund - Class T,BCT,Equity Fund - Asia Equity Fund,4/8/04,684.3,6,1.21172,3.57,2.83,-20.88,-8.69,46.15,26.94,2.78,6.99,8.48,26.94,14.72,96.53,463.38,Up to 1.15,Up to 0.5,0.2,0.45,0
291,Manulife RetireChoice (MPF) Scheme,Allianz Balanced Fund - Class A,BCT,Mixed Assets Fund - 61% to 80% Equity,7/2/01,28.65,5,1.46249,7.78,4.91,-15.93,1.81,17.84,18.06,5.27,5.16,4.84,18.06,29.31,65.32,221.72,Up to 1.38,Up to 0.53,0.2,0.65,0
292,Manulife RetireChoice (MPF) Scheme,Allianz Balanced Fund - Class B,BCT,Mixed Assets Fund - 61% to 80% Equity,2/2/01,468.92,5,1.2619,8,5.12,-15.77,2.02,18.13,18.3,5.48,5.47,4.97,18.3,30.6,70.26,232.45,Up to 1.18,Up to 0.53,0.2,0.45,0
293,Manulife RetireChoice (MPF) Scheme,Allianz Balanced Fund - Class T,BCT,Mixed Assets Fund - 61% to 80% Equity,8/12/00,514.52,5,1.232,8.03,5.15,-15.74,2.05,18.28,18.33,5.52,5.28,5.01,18.33,30.8,67.24,237.6,Up to 1.15,Up to 0.5,0.2,0.45,0
294,Manulife RetireChoice (MPF) Scheme,Allianz Capital Stable Fund - Class A,BCT,Mixed Assets Fund - 21% to 40% Equity,7/2/01,18.28,4,1.47671,2,4.33,-14.63,-1.55,11.61,9.27,1.05,2.24,3.2,9.27,5.34,24.86,117.92,Up to 1.38,Up to 0.53,0.2,0.65,0
295,Manulife RetireChoice (MPF) Scheme,Allianz Capital Stable Fund - Class B,BCT,Mixed Assets Fund - 21% to 40% Equity,2/2/01,224.02,4,1.27596,2.21,4.53,-14.46,-1.35,11.82,9.49,1.25,2.46,3.36,9.49,6.39,27.56,126.71,Up to 1.18,Up to 0.53,0.2,0.45,0
296,Manulife RetireChoice (MPF) Scheme,Allianz Capital Stable Fund - Class T,BCT,Mixed Assets Fund - 21% to 40% Equity,11/12/00,223.53,4,1.24645,2.24,4.57,-14.43,-1.32,11.88,9.52,1.28,2.46,3.47,9.52,6.56,27.57,133.54,Up to 1.15,Up to 0.5,0.2,0.45,0
297,Manulife RetireChoice (MPF) Scheme,Allianz Flexi Balanced Fund - Class A,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,31-08-2004,12.77,3,1.45935,2.97,3.44,-7.39,5.56,8.21,7.77,3.37,3.02,3.15,7.77,18.04,34.69,93.41,Up to 1.38,Up to 0.53,0.2,0.65,0
298,Manulife RetireChoice (MPF) Scheme,Allianz Flexi Balanced Fund - Class B,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,9/8/04,178.34,3,1.25843,3.18,3.65,-7.2,5.77,8.38,7.98,3.58,3.21,3.36,7.98,19.22,37.13,101.76,Up to 1.18,Up to 0.53,0.2,0.45,0
299,Manulife RetireChoice (MPF) Scheme,Allianz Flexi Balanced Fund - Class T,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,9/8/04,169.52,3,1.22863,3.21,3.68,-7.18,5.81,8.28,8.01,3.61,3.23,3.45,8.01,19.4,37.38,105.24,Up to 1.15,Up to 0.5,0.2,0.45,0
300,Manulife RetireChoice (MPF) Scheme,Allianz Greater China Fund - Class A,BCT,Equity Fund - Greater China Equity Fund,1/11/11,16.88,7,1.45828,12.2,-7.33,-23.1,-10.73,40.88,36.05,1.98,5.86,6.06,36.05,10.32,76.74,127.99,Up to 1.38,Up to 0.53,0.2,0.65,0
301,Manulife RetireChoice (MPF) Scheme,Allianz Greater China Fund - Class B,BCT,Equity Fund - Greater China Equity Fund,4/10/11,309.15,7,1.25785,12.43,-7.14,-22.95,-10.55,41.14,36.32,2.19,6.05,7.56,36.32,11.43,79.98,178.73,Up to 1.18,Up to 0.53,0.2,0.45,0
302,Manulife RetireChoice (MPF) Scheme,Allianz Greater China Fund - Class T,BCT,Equity Fund - Greater China Equity Fund,3/10/11,237.45,7,1.22818,12.46,-7.12,-22.93,-10.52,41.16,36.36,2.22,6.05,7.28,36.36,11.59,79.95,168.84,Up to 1.15,Up to 0.5,0.2,0.45,0
303,Manulife RetireChoice (MPF) Scheme,Allianz Growth Fund - Class A,BCT,Mixed Assets Fund - 81% to 100% Equity,7/2/01,56.05,5,1.47127,10.75,5.41,-16.99,3.81,20.75,22.67,7.41,6.43,5.48,22.67,42.97,86.46,274.03,Up to 1.38,Up to 0.53,0.2,0.65,0
304,Manulife RetireChoice (MPF) Scheme,Allianz Growth Fund - Class B,BCT,Mixed Assets Fund - 81% to 100% Equity,2/2/01,915.2,5,1.2701,10.98,5.62,-16.83,4.02,20.94,22.91,7.63,6.63,5.64,22.91,44.41,90.03,288.54,Up to 1.18,Up to 0.53,0.2,0.45,0
305,Manulife RetireChoice (MPF) Scheme,Allianz Growth Fund - Class T,BCT,Mixed Assets Fund - 81% to 100% Equity,8/12/00,977.71,5,1.24018,11.01,5.65,-16.8,4.05,21.04,22.95,7.66,6.69,5.7,22.95,44.62,91.14,297.19,Up to 1.15,Up to 0.5,0.2,0.45,0
306,Manulife RetireChoice (MPF) Scheme,Allianz Hong Kong Fund - Class A,BCT,Equity Fund - Hong Kong Equity Fund,31-08-2004,42.6,7,1.42198,15.13,-17.95,-14.23,-12.1,26.9,34.41,1.86,4.07,7.36,34.41,9.64,48.97,349.59,Up to 1.38,Up to 0.53,0.2,0.65,0
307,Manulife RetireChoice (MPF) Scheme,Allianz Hong Kong Fund - Class B,BCT,Equity Fund - Hong Kong Equity Fund,4/8/04,808.41,7,1.22108,15.36,-17.78,-14.06,-11.93,27.22,34.68,2.06,4.27,7.83,34.68,10.74,51.98,396.16,Up to 1.18,Up to 0.53,0.2,0.45,0
308,Manulife RetireChoice (MPF) Scheme,Allianz Hong Kong Fund - Class T,BCT,Equity Fund - Hong Kong Equity Fund,4/8/04,692.23,7,1.19113,15.4,-17.76,-14.03,-11.9,27.22,34.72,2.09,4.32,7.94,34.72,10.91,52.59,406.41,Up to 1.15,Up to 0.5,0.2,0.45,0
309,Manulife RetireChoice (MPF) Scheme,Allianz MPF Age 65 Plus Fund - Class A,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,6.32,4,0.74495,3.41,7.19,-15.07,0.75,8.08,6.84,1.04,n.a.,2.2,6.84,5.3,n.a.,20.5,Up to 0.75,Up to 0.36,0,0.39,0
310,Manulife RetireChoice (MPF) Scheme,Allianz MPF Age 65 Plus Fund - Class B,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,123.25,4,0.74652,3.42,7.18,-15.08,0.76,7.65,6.84,1.04,n.a.,2.43,6.84,5.29,n.a.,22.86,Up to 0.75,Up to 0.36,0,0.39,0
311,Manulife RetireChoice (MPF) Scheme,Allianz MPF Age 65 Plus Fund - Class T,BCT,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,136.47,4,0.74697,3.42,7.18,-15.08,0.76,7.65,6.84,1.04,n.a.,2.43,6.84,5.29,n.a.,22.86,Up to 0.75,Up to 0.36,0,0.39,0
312,Manulife RetireChoice (MPF) Scheme,Allianz MPF Conservative Fund - Class A,BCT,Money Market Fund - MPF Conservative Fund,7/2/01,21.63,1,1.04125,3.28,2.92,0.3,0,0.41,1.97,1.58,0.98,0.79,1.97,8.18,10.22,21.47,Up to 0.98,Up to 0.53,0.2,0.25,0
313,Manulife RetireChoice (MPF) Scheme,Allianz MPF Conservative Fund - Class B,BCT,Money Market Fund - MPF Conservative Fund,2/2/01,519.48,1,1.04094,3.28,2.94,0.3,0,0.41,1.97,1.59,0.98,0.79,1.97,8.2,10.21,21.53,Up to 0.98,Up to 0.53,0.2,0.25,0
314,Manulife RetireChoice (MPF) Scheme,Allianz MPF Conservative Fund - Class T,BCT,Money Market Fund - MPF Conservative Fund,11/12/00,534.82,1,1.01096,3.31,3.04,0.3,0,0.43,1.99,1.62,1,0.87,1.99,8.36,10.48,24.04,Up to 0.95,Up to 0.5,0.2,0.25,0
315,Manulife RetireChoice (MPF) Scheme,Allianz MPF Core Accumulation Fund - Class A,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,61.38,5,0.77777,10.95,13.99,-16.8,10.53,12.52,14.69,7.76,n.a.,6.85,14.69,45.32,n.a.,76.55,Up to 0.75,Up to 0.36,0,0.39,0
316,Manulife RetireChoice (MPF) Scheme,Allianz MPF Core Accumulation Fund - Class B,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,740.86,5,0.77728,10.95,14.01,-16.8,10.54,12.64,14.69,7.77,n.a.,7.14,14.69,45.35,n.a.,80.8,Up to 0.75,Up to 0.36,0,0.39,0
317,Manulife RetireChoice (MPF) Scheme,Allianz MPF Core Accumulation Fund - Class T,BCT,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,472.78,5,0.77746,10.95,14.01,-16.8,10.54,12.64,14.69,7.77,n.a.,7.14,14.69,45.35,n.a.,80.8,Up to 0.75,Up to 0.36,0,0.39,0
318,Manulife RetireChoice (MPF) Scheme,Allianz Oriental Pacific Fund - Class A,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,31-10-2011,28.95,6,1.55859,1.14,13.87,-20.24,12.94,41.7,25.39,10.45,10.56,9.16,25.39,64.34,172.92,241.15,Up to 1.38,Up to 0.53,0.2,0.65,0
319,Manulife RetireChoice (MPF) Scheme,Allianz Oriental Pacific Fund - Class B,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,4/10/11,236.64,6,1.35823,1.34,14.1,-20.08,13.17,42.15,25.64,10.67,10.76,10.25,25.64,66,177.76,294.97,Up to 1.18,Up to 0.53,0.2,0.45,0
320,Manulife RetireChoice (MPF) Scheme,Allianz Oriental Pacific Fund - Class T,BCT,Mixed Assets Fund - Uncategorized Mixed Asset Fund,4/10/11,233.61,6,1.32814,1.37,14.13,-20.05,13.2,42.15,25.68,10.7,10.76,10.27,25.68,66.25,177.93,295.96,Up to 1.15,Up to 0.5,0.2,0.45,0
321,Manulife RetireChoice (MPF) Scheme,Allianz RMB Money Market Fund - Class A,BCT,Money Market Fund - Other than MPF Conservative Fund,7/10/13,2.06,3,1.20114,-0.4,-0.14,-4.36,2.21,4.94,1.09,0.37,0.36,0.26,1.09,1.85,3.69,3.21,Up to 0.98,Up to 0.5,0.2,0.25,0
322,Manulife RetireChoice (MPF) Scheme,Allianz RMB Money Market Fund - Class B,BCT,Money Market Fund - Other than MPF Conservative Fund,4/10/13,60.87,3,1.20164,-0.4,-0.14,-4.36,2.2,4.93,1.09,0.36,0.36,0.27,1.09,1.84,3.68,3.26,Up to 0.98,Up to 0.53,0.2,0.25,0
323,Manulife RetireChoice (MPF) Scheme,Allianz RMB Money Market Fund - Class T,BCT,Money Market Fund - Other than MPF Conservative Fund,4/10/13,51.08,3,1.17122,-0.37,-0.11,-4.33,2.23,4.96,1.11,0.4,0.38,0.29,1.11,1.99,3.86,3.58,Up to 0.95,Up to 0.5,0.2,0.25,0
324,Manulife RetireChoice (MPF) Scheme,Allianz Stable Growth Fund - Class A,BCT,Mixed Assets Fund - 41% to 60% Equity,7/2/01,18.02,5,1.45293,4.91,4.66,-15.68,-0.06,15.07,13.86,3.08,3.75,4.08,13.86,16.39,44.44,169.05,Up to 1.38,Up to 0.53,0.2,0.65,0
325,Manulife RetireChoice (MPF) Scheme,Allianz Stable Growth Fund - Class B,BCT,Mixed Assets Fund - 41% to 60% Equity,2/2/01,469.29,5,1.25199,5.12,4.88,-15.51,0.14,15.2,14.08,3.29,3.95,4.26,14.08,17.56,47.28,180.52,Up to 1.18,Up to 0.53,0.2,0.45,0
326,Manulife RetireChoice (MPF) Scheme,Allianz Stable Growth Fund - Class T,BCT,Mixed Assets Fund - 41% to 60% Equity,8/12/00,459.08,5,1.22228,5.15,4.91,-15.49,0.17,15.37,14.12,3.32,4.01,4.37,14.12,17.74,48.22,189.92,Up to 1.15,Up to 0.5,0.2,0.45,0
327,MASS Mandatory Provident Fund Scheme,Age 65 Plus Fund,YF Life,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,138.8,4,0.80245,3.83,8.36,-15.16,0.65,9.61,7.52,1.32,n.a.,2.58,7.52,6.77,n.a.,24.4,0.67,0.59,0,0.08,0
328,MASS Mandatory Provident Fund Scheme,Asian Bond Fund,YF Life,Bond Fund - Asia Bond Fund,17-03-2003,327.17,5,1.49583,1.95,6.55,-13.47,-1.49,3.57,6.3,2.21,1.64,4.67,6.3,11.56,17.67,180.65,1.02,0.51,0,0.51,0
329,MASS Mandatory Provident Fund Scheme,Asian Pacific Equity Fund,YF Life,Equity Fund - Asia Equity Fund,19-03-2007,329.18,6,1.54849,10.38,4.04,-20.89,-3.9,6.4,26.33,6.16,4.07,3.9,26.33,34.88,49.09,103.81,1.02,0.63,0,0.39,0
330,MASS Mandatory Provident Fund Scheme,Core Accumulation Fund,YF Life,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,411.54,4,0.79883,11.09,16.07,-16.56,9.99,12.51,15.87,8.39,n.a.,7.08,15.87,49.65,n.a.,79.94,0.67,0.59,0,0.08,0
331,MASS Mandatory Provident Fund Scheme,European Equity Fund,YF Life,Equity Fund - Europe Equity Fund,19-03-2007,151.3,5,1.4947,4.15,20.83,-11.19,4.89,-2.5,22.28,12.32,5.98,2.99,22.28,78.9,78.89,73.04,1.02,0.51,0,0.51,0
332,MASS Mandatory Provident Fund Scheme,Global Bond Fund,YF Life,Bond Fund - Global Bond Fund,17-03-2003,164.36,4,1.40505,-3.88,4.35,-13.57,-4.24,1.14,4.55,-1.97,-1.11,0.93,4.55,-9.47,-10.58,23.28,1.02,0.51,0,0.51,0
333,MASS Mandatory Provident Fund Scheme,Global Equity Fund,YF Life,Equity Fund - Global Equity Fund,17-03-2003,344.51,5,1.46915,15.15,22.03,-22.96,21.78,8.93,20.47,13.95,7.44,7.23,20.47,92.22,105.01,384.84,1.02,0.51,0,0.51,0
334,MASS Mandatory Provident Fund Scheme,Global Growth Fund,YF Life,Mixed Assets Fund - 61% to 80% Equity,1/12/00,488.65,5,1.421,7.82,4.86,-15.99,1.78,17.94,18.56,5.32,5.16,4.71,18.56,29.62,65.53,214.93,0.91,Up to 0.58,0,0.33 - 0.43,0
335,MASS Mandatory Provident Fund Scheme,Global Stable Fund,YF Life,Mixed Assets Fund - 41% to 60% Equity,1/12/00,295.19,4,1.42291,4.97,4.61,-15.72,-0.11,15.03,14.33,3.13,3.75,3.89,14.33,16.69,44.61,158.98,0.91,Up to 0.58,0,0.33 - 0.43,0
336,MASS Mandatory Provident Fund Scheme,Greater China Equity Fund,YF Life,Equity Fund - Greater China Equity Fund,1/5/11,681.73,6,1.40858,12.78,-9.82,-29.01,-7,51.05,34.01,1.22,7.83,5.72,34.01,6.24,112.68,124.06,Up to 1.0395,0.5395,0,Up to 0.5,0
337,MASS Mandatory Provident Fund Scheme,Guaranteed Fund,YF Life,Guaranteed Fund,20-01-2006,280.82,4,3.24508,0.2,2.35,-16.22,-3.37,9.59,7.51,-0.79,0.36,0.52,7.51,-3.88,3.71,10.72,0.91,Up to 0.58,0,0.33 - 0.43,1.75
338,MASS Mandatory Provident Fund Scheme,Hong Kong Equities Fund,YF Life,Equity Fund - Hong Kong Equity Fund,19-03-2007,518.57,7,1.37614,15.69,-17.97,-14.25,-12.2,27.01,34.29,1.89,4.08,2.75,34.29,9.85,49.2,65.74,0.91,Up to 0.58,0,0.33 - 0.43,0
339,MASS Mandatory Provident Fund Scheme,MPF Conservative Fund,YF Life,Money Market Fund - MPF Conservative Fund,1/12/00,659.28,1,0.87598,3.39,3.26,0.32,0,0.47,2.16,1.71,1.07,0.74,2.16,8.86,11.27,20.33,Up to 0.73,Up to 0.58,0,Up to 0.25,0
340,MASS Mandatory Provident Fund Scheme,US Equity Fund,YF Life,Equity Fund - United States Equity Fund,19-03-2007,"1,048.97",6,1.04762,21.77,28.27,-36.96,16.1,43.08,20.04,8.62,11.61,8.63,20.04,51.23,200.22,367.13,0.98,0.59,0,0.39,0
341,My Choice Mandatory Provident Fund Scheme,My Choice Age 65 Plus Fund,BOCIP,Mixed Assets Fund - Default Investment Strategy - Age 65 Plus Fund,1/4/17,81.32,4,0.7694,3.47,7.05,-14.45,1.09,9.27,6.07,0.99,n.a.,2.35,6.07,5.06,n.a.,22.09,0.71,0.51,0,0.2,0
342,My Choice Mandatory Provident Fund Scheme,My Choice Asia Equity Fund,BOCIP,Equity Fund - Asia Equity Fund,28-07-2010,238.14,5,1.09501,11.87,10.03,-21.24,-2.96,18.05,19.91,5.38,7.26,6.09,19.91,29.97,101.54,146.61,0.96,0.61,0,0.35,0
343,My Choice Mandatory Provident Fund Scheme,My Choice Balanced Fund,BOCIP,Mixed Assets Fund - 61% to 80% Equity,28-07-2010,247.69,5,1.04376,6.36,5.18,-15.91,0.63,18.41,16.79,5.07,5.48,5.5,16.79,28.08,70.44,126.4,0.895,0.595,0,0.3,0
344,My Choice Mandatory Provident Fund Scheme,My Choice China Equity Fund,BOCIP,Equity Fund - Greater China Equity Fund,28-07-2010,616.14,7,1.06687,13.04,-9.37,-28.63,-6.33,51.75,33.81,1.61,8.36,7.17,33.81,8.29,123.29,188.05,0.96,0.5395,0,0.4205,0
345,My Choice Mandatory Provident Fund Scheme,My Choice Core Accumulation Fund,BOCIP,Mixed Assets Fund - Default Investment Strategy - Core Accumulation Fund,1/4/17,241.05,5,0.80511,9.77,13.32,-14.82,9.78,14.1,13.71,7.66,n.a.,6.79,13.71,44.62,n.a.,75.77,0.71,0.51,0,0.2,0
346,My Choice Mandatory Provident Fund Scheme,My Choice Global Bond Fund,BOCIP,Bond Fund - Global Bond Fund,28-07-2010,120.32,4,0.99802,-3.17,4.79,-17.75,-4.79,2.65,3.24,-3.18,-1.38,-0.52,3.24,-14.91,-12.98,-7.61,0.94,0.61,0,0.33,0
347,My Choice Mandatory Provident Fund Scheme,My Choice Global Equity Fund,BOCIP,Equity Fund - Global Equity Fund,28-07-2010,573.68,5,1.0425,16.26,18.05,-17.89,18.49,7.75,20.52,13.13,7.67,8.32,20.52,85.35,109.43,238.72,0.895,0.595,0,0.3,0
348,My Choice Mandatory Provident Fund Scheme,My Choice Growth Fund,BOCIP,Mixed Assets Fund - 81% to 100% Equity,28-07-2010,438.5,6,1.02738,10.54,4.87,-20.28,1.77,15.24,19.35,5.46,5.84,6.07,19.35,30.44,76.38,145.91,0.96,0.61,0,0.35,0
349,My Choice Mandatory Provident Fund Scheme,My Choice HKD Bond Fund,BOCIP,Bond Fund - Hong Kong Dollar Bond Fund,28-07-2010,81.95,3,1.03782,2.98,6.02,-9.04,-1.36,6.21,4.45,0.65,1.42,1.68,4.45,3.28,15.18,29.04,0.96,0.5395,0,0.4205,0`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseNumber(val: string): number {
  if (!val || val.toLowerCase() === 'n.a.') return 0;
  const clean = val.replace(/["',]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export const getFunds = (): MPFFund[] => {
  if (!RAW_CSV_DATA) return [];
  
  const lines = RAW_CSV_DATA.trim().split('\n');
  const funds: MPFFund[] = [];
  
  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = parseCSVLine(line);
    // Expecting mostly valid rows
    if (cols.length < 15) continue; 
    
    // Mapping:
    // 1: Scheme
    // 2: Constituent Fund
    // 3: MPF Trustee
    // 4: Fund Type
    // 5: Launch Date
    // 6: Fund size
    // 7: Risk Class
    // 8: Latest FER
    // 9: 2024 Return
    // 10: 2023 Return
    // 11: 2022 Return
    // 12: 2021 Return
    // 13: 2020 Return
    // 14: 1Y Annualized
    // 15: 5Y Annualized
    
    const fund: MPFFund = {
      scheme_name: cols[1],
      constituent_fund: cols[2],
      mpf_trustee: cols[3],
      fund_type: cols[4],
      launch_date: cols[5],
      fund_size_hkd_m: parseNumber(cols[6]),
      risk_class: parseNumber(cols[7]),
      latest_fer: parseNumber(cols[8]),
      return_2024: parseNumber(cols[9]),
      return_2023: parseNumber(cols[10]),
      return_2022: parseNumber(cols[11]),
      return_2021: parseNumber(cols[12]),
      return_2020: parseNumber(cols[13]),
      annualized_return_1y: parseNumber(cols[14]),
      annualized_return_3y: 0, 
      annualized_return_5y: parseNumber(cols[15]),
    };
    
    // Approximate 3Y return using geometric mean of yearly returns (2022, 2023, 2024)
    if (fund.return_2024 !== 0 || fund.return_2023 !== 0 || fund.return_2022 !== 0) {
       const p1 = 1 + (fund.return_2024 || 0) / 100;
       const p2 = 1 + (fund.return_2023 || 0) / 100;
       const p3 = 1 + (fund.return_2022 || 0) / 100;
       const geom = Math.pow(p1 * p2 * p3, 1/3) - 1;
       fund.annualized_return_3y = parseFloat((geom * 100).toFixed(2));
    }

    funds.push(fund);
  }
  
  return funds;
};

export const getManagerStats = (funds: MPFFund[]) => {
  const statsMap: Record<string, { name: string, count: number, aum: number }> = {};
  
  funds.forEach(fund => {
    const trustee = fund.mpf_trustee;
    if (!trustee) return;
    
    if (!statsMap[trustee]) {
      statsMap[trustee] = { name: trustee, count: 0, aum: 0 };
    }
    statsMap[trustee].count++;
    statsMap[trustee].aum += fund.fund_size_hkd_m;
  });
  
  return Object.values(statsMap).sort((a, b) => b.aum - a.aum);
};