pro = pro || {};

(function (pro) {
    pro.time = {};

    pro.time.Countdown = function ProTimer(secondsToCount, onTick) {
        var endDate = new Date() - secondsToCount * -1000,
            timeoutId;

        updateTime(secondsToCount);

        function updateTime() {
            if (secondsToCount > 0) {
                onTick(secondsToCount);
                timeoutId = setTimeout(updateTime, parseInt((endDate - new Date()) / secondsToCount));
                secondsToCount--;
            }
        }

        return {
            out: function () { clearTimeout(timeoutId); }
        };
    };
})(pro);