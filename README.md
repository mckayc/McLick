# mClick - Mouse Click and Cursor Highlighter for screen recordings.

Use this Chrome extension for the following:
* While doing a screencast recording, this will clearly show where your mouse cursor is and where you click on the page. This can be useful for doing webapp tutorials.
* While doing an online presentation, this can help so that your audience can clearly see where your mouse cursor is.
* If you use Chromecast, this can highlight your mouse cursor to make it easier to spot.

![Alt text](/example01.gif?raw=true "Tutorial.")
![Alt text](/example02.gif?raw=true "Tutorial.")
![Alt text](/example03.gif?raw=true "Tutorial.")
![Alt text](/example04.gif?raw=true "Tutorial.")
![Alt text](/example05.gif?raw=true "Tutorial.")


**Notes:**
* I am NOT a programmer and this is my first Chrome extension. I made extension because I saw a need (for myself) and didn't find anything suitable for what I wanted.
* I realize this extension is not that great and has a lot of room for improvement.
* Below I have a basic roadmap of what I intend (hope) to do with this extension.
* If you have any suggestions or would like to help, you are welcome to send me an email at <mckayc+mclick@gmail.com>.
* To get the most utility from this extension, you should lower your expectations.

# Road map:

**✓ Version 0.2** - Have a basic functional extension.
* Mouse cursor is highlighted when moving on the screen.
* There are mouse click indications for mouse down and mouse up.
* You can turn the extension on and off.

**✓ Version 0.3** - Have user input for most basic functions.
* User can input custom values for highlight size for all functions (move, click, mouseup, etc).
* User can input custom values for colors.
* User can input custom values for opacities.

**✓ Version 0.4** - Polished extension. - Still needs more work Autosave
* Icons will be improved and looked better.
* Options window will actually look nice(r) and only be as big as needed. ~~Popup window instead of full window. (I don't think this is actually possible.)~~
* Default settings for extension will make it look nice and negate any need for most people to ever use options.

**Version 0.5** - First release.
* Do thorough testing and bug fixes. Make sure basic functions work as intended in most circumstances.
* Package extension and put it on the Chrome app store.
* Add example gif in this README.md

**Version 0.6** - Extended features.
* Improve transitions and animations (give user options for these?).
* Come up with something nifty for click and drag. Perhaps a new div shape?
* In options, have live preview for shapes.

**Version 0.7** - Improve options. ~~No need for manual input.~~
* Start implementing some of Dallin's code such as right click, left click, middle click and double click.
* ~~User has the option to use color picker for colors.~~
* User has the option to use a slider for object size.
* ~~User has the option to use a slider for opacity.~~

**Version 0.8** - Explore more features. Test features to see if they are useful or not.
* Have an indicator for scroll up and scroll down. (?)
* Improve animations.
* Have user options to toggle every feature.

**Version 0.9** - Bug fixes, code cleanup, and final polish.
* Fix all bugs so that the extension works in all likely environments.
* Look over code and clean up what is not necessary. Improve comments to make extension more useful to someone who wants to fork code.
* Make any last changes for version 1 release.

**Version 1.0** - Release!
* Rerelease on Chrome app store.
* Share extension with coworkers and friends.
* Write blog post about extension and do some promotion.
* Update roadmap for version 2.0.
* Buy myself ice cream and/or pizza and celebrate.

---
**Version 2.0+** - Start integrating keyboard indicators.
* Come up with a slick way to show keyboard key presses.
* Find out how to display key press combinations.
* Allow user options to toggle this feature.
* Be able to use on more than just the active page.

---

**Credits:**
* For the basic framework of this extension, I looked at the Chrome extension "mouse_thing" (https://github.com/jared-schmidt/mouse_thing).
* For the color picker, I used Spectrum (https://bgrins.github.io/spectrum).
* For the value sliders, I intend to use Simple Slider (http://loopj.com/jquery-simple-slider/) though I have not figured out how to implement this yet.
* For bug fixes and additional code, I enlisted the help of my friends Matt and Ryan as well as my brother Dallin.
