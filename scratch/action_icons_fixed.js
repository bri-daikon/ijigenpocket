const actionIconsData = [
1625:   {
1626:     name: "spot",
1627:     label: "目星",
1628:     sub: "SPOT",
1629:     path: `<path d="M15,40 Q40,15 65,40 Q40,65 15,40 Z" fill="none" stroke="#00f0ff" stroke-width="2"/><circle cx="40" cy="40" r="8" fill="none" stroke="#00f0ff" stroke-width="2"/><circle cx="40" cy="40" r="3" fill="#ff007f"/>`
1630:   },
1631:   {
1632:     name: "listen",
1633:     label: "聞き耳",
1634:     sub: "LISTEN",
1635:     path: `<path d="M30,30 C30,20 45,15 50,25 C55,35 40,45 45,55 C48,
<truncated 45281 bytes>
pacity: 1
2332:   });
2333: 
2334:   let plW = 160;
2335:   let plH = 170;
2336:   if (layoutType === 'right-vertical') {
2337:     if (numPlayers <= 3) { plW = 180; plH = 200; }
2338:     else if (numPlayers === 4) { plW = 170; plH = 150; }
2339:     else { plW = 160; plH = 120; }
2340:   }
2341: 
2342:   for (let i = 0; i < numPlayers; i++) {
2343:     const plSvg = gen.pl();
2344:     let plX = 1050;
2345:     let plY = 40;
2346:     
2347:     if (layoutType === 'right-vertical') {
2348:       plX = 1050;
2349:       if (numPlayers === 1) {
2350:         plY = 260;
2351:       } else {
2352:         plY = 40 + i * (640 - plH) / (numPlayers - 1);
2353:       }
2354:     } else {
2355:       plY = 510;
2356:       if (numPlayers === 1) {
2357:         plX = 660;
2358:       } else {
2359:         plX = 280 + i * (720 - plW) / (numPlayers - 1);
2360:       }
2361:     }
2362: 
2363:     panels.push({
2364:       id: `ai-pl-${i}-${Date.now()}`,
2365:       url: createSvgUrl(plSvg),
2366:       x: plX,
2367:       y: plY,
2368:       width: plW,
2369:       height: plH,
2370:       originalRatio: plW / plH,
2371:       flipH: false,
2372:       flipV: false,
2373:       visible: true,
2374:       opacity: 1
2375:     });
2376:   }
2377: 
2378:   const menuLabels = ["houserule", "battle", "insanity", "growth", "other"];