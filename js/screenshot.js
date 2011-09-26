
var VideoSnapshotCapturer = function() {

    var Capturer = function(video, snapshotList, ImageEditor) {
        this.ImageEditor = ImageEditor;
        this.video = video;
        this.snapshotList = snapshotList;

        var me = this;
        $(video).bind('click', function() {
            me.takeSnapshot.call(me);
        });
    };

    Capturer.prototype.takeSnapshot = function() {
        var snapshot = document.createElement('canvas');
        $(snapshot).addClass('snapshot');
        console.log(this.video.videoHeight);
        console.log(this.video.videoWidth);

            console.log(document.defaultView.getComputedStyle(this.video, "").getPropertyValue("width"));

        snapshot.height = this.video.clientHeight;
        snapshot.width = this.video.clientWidth;
        
        var context = snapshot.getContext('2d');
        context.scale(0.2, 0.2);
        context.drawImage(this.video, 0, 0);

        var container = $('#snapshotContainer');
        container.empty();
        container.append(snapshot);

        var me = this;
        new me.ImageEditor(snapshot);


    };


    return Capturer;
}();