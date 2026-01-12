
/* MagicMirror² Module: MMM-CalendarExt3Controls
 * Controls MMM-CalendarExt3 month navigation via CX3_GET_CONFIG / CX3_SET_CONFIG
 */
Module.register("MMM-CalendarExt3Controls", {
  defaults: {
    targetInstanceId: "MY_CALENDAR", // Must match MMM-CalendarExt3 instanceId
    mode: "calendar", //calendar or journal
    journalDaysIncrement: 7, // Number of days to increment/decrement in journal mode
  },

  start() {
    Log.info(this.name + " started");
  },

  // Build header controls (no inline styles; CSS will handle visuals)
  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "cx3-controls-wrapper";

    if (this.config.mode === "calendar") {
      const prevBtn = this.addButton("Previous month", "⬅️", () => this.changeMonth(-1), "cx3-btn-prev");
      const todayBtn = this.addButton("Current month", "📅", () => this.goToMonthToday(), "cx3-btn-today");
      const nextBtn = this.addButton("Next month", "➡️", () => this.changeMonth(1), "cx3-btn-next");

      wrapper.appendChild(prevBtn);
      wrapper.appendChild(todayBtn);
      wrapper.appendChild(nextBtn);
    } else if (this.config.mode === "journal") {
      const prevBtn = this.addButton("Previous week", "⬅️", () => this.changeDay(0-this.config.journalDaysIncrement), "cx3-btn-prev");
      const todayBtn = this.addButton("Today", "📅", () => this.goToDayToday(), "cx3-btn-today");
      const nextBtn = this.addButton("Next week", "➡️", () => this.changeDay(this.config.journalDaysIncrement), "cx3-btn-next");

      wrapper.appendChild(prevBtn);
      wrapper.appendChild(todayBtn);
      wrapper.appendChild(nextBtn);
    }
    return wrapper;
  },

  addButton(title, emoji, onClickFunction, cssClass) {
      const btn = document.createElement("button");
      btn.className = `cx3-btn ${cssClass}`;
      btn.setAttribute("type", "button");
      btn.setAttribute("aria-label", title);
      btn.innerHTML = `<span class="label">${title}</span><span class="fallback">${emoji}</span>`;
      btn.onclick = () => {
        onClickFunction(arguments);
        this.sendNotification("CX3_CONTROLS_BUTTON_CLICKED");
      };
      return btn;
  },

  // Utility: read current config from MMM-CalendarExt3, then call back
  requestCurrentMonthConfig(callback) {
    this.sendNotification("CX3_GET_CONFIG", {
      instanceId: this.config.targetInstanceId,
      callback
    });
  },

  requestCurrentDayConfig(callback) {
    this.sendNotification("CX3J_GET_CONFIG", {
      instanceId: this.config.targetInstanceId,
      callback
    });
  },

  // Change month by offset (-1 = prev, +1 = next)
  changeMonth(offset) {
    this.requestCurrentMonthConfig((curr) => {
      const currentIndex = Number(curr?.monthIndex || 0);
      this.sendNotification("CX3_SET_CONFIG", {
        instanceId: this.config.targetInstanceId,
        monthIndex: currentIndex + offset
      });
    });
  },

  changeDay(offset) {
    //Currently no way of getting the journal config, so we need to keep track of dayIndex ourselves
    this.currentDayIndex = Number(this.currentDayIndex || 0) + offset;
      this.sendNotification("CX3J_CONFIG", {
        instanceId: this.config.targetInstanceId,
        dayIndex: this.currentDayIndex
      });
    /*
    this.requestCurrentDayConfig((curr) => {
      const currentIndex = Number(curr?.dayIndex || 0);
      this.sendNotification("CX3J_SET_CONFIG", {
        instanceId: this.config.targetInstanceId,
        dayIndex: currentIndex + offset
      });
    });
    */
  },

  // Jump to current month
  goToMonthToday() {
    this.sendNotification("CX3_RESET", {
      instanceId: this.config.targetInstanceId
    });
  },

  goToDayToday() {
    this.currentDayIndex = 0;
    this.sendNotification("CX3J_RESET", {
      instanceId: this.config.targetInstanceId
    });
  }
});
