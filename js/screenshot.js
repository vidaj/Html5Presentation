
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
        var context = snapshot.getContext('2d');
        context.scale(0.2, 0.2);
        context.drawImage(this.video, 0, 0);

        var container = $('#snapshotContainer');
        container.empty();
        container.append(snapshot);
        //var listElement = $(document.createElement('li'));
        //listElement.addClass('snapshot');
        //$(snapshot).appendTo(listElement);
        //listElement.appendTo(this.snapshotList);

        var me = this;
        //$(snapshot).bind('click', function() {
        //    $(this).unbind('click');
        new me.ImageEditor(snapshot, $($('#canvasEditTemplate')[0].innerHTML));
        //})
    };




    return Capturer;
}();