/* This game is premium, so postpone this bot.

can't stop game ID: 11

selector is chooseCombo_both_0 for first, chooseCombo_both_1 for 2nd, etc
document.getElementById('chooseCombo_both_1').text provides "Progresses on 7 and 6"

stop = #action_stop
continue = #action_continue

to determine active player: check if "avatar_active_wrap_${your bga id}" has a display: block;
<div class="emblemwrap" id="avatar_active_wrap_22430351" style="display: block;">
                                    <img src="https://x.boardgamearena.net/data/themereleases/200316-1631/img/layout/active_player.gif" alt="" class="avatar avatar_active" id="avatar_active_22430351">    
                                    <div class="icon20 icon20_night this_is_night"></div>
                                </div>

You can also see it in the title, which changes.

This will tell if you are the active player: document.title.includes('You must ')
The titles are going to one of (ignoring the triangle preface):

"◥ You must stop or continue • Can't Stop • Board Game Arena"
"◥ You must choose a combination of dice • Can't Stop • Board Game Arena"
*/