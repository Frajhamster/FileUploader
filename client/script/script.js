var socket = io();

socket.on('returnHtml', data => {
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(data.html, 'text/html');

    document.open();
    document.write(htmlDocument.documentElement.innerHTML);
    document.close();

    socket.emit('requestAllFilesData');
});

socket.on('wrongPassword', data => {
    // Do some cute CSS thingy when password is wrong
});

socket.on('returnAllFilesData', data => {
    $('div[name="contAllFiles"]').empty();
    for (const file of data.filesData) {
        let fileSize = getFileSize(file[1]);
        let fileDiv = $('<div class="contFile" name="' + file[0] + '">'
                    +       '<div class="contFileName">' + file[0] + '</div>'
                    +       '<div class="contFileSize">' + fileSize + '</div>'
                    +   '</div>');
        $('div[name="contAllFiles"]').append(fileDiv);
        $('div[name="' + file[0] + '"').on('click', function() {
            socket.emit('downloadFile', {   
                fileName: file[0]
            });
        });
    }
});

socket.on('returnFileLink', data => {
    const downloadLink = document.createElement('a');
    downloadLink.href = data.fileLink;
    downloadLink.download = data.fileName;
    downloadLink.click();

    URL.revokeObjectURL(downloadLink.href);
});


// Utility functions -> Move to another file later
function getFileSize(sizeInBytes) {
    const kb = 1000;
    const mb = kb * kb;
    const gb = kb * kb * kb;
    const tb = kb * kb * kb * kb;

    if (sizeInBytes < kb) {
        return sizeInBytes + " B";
    }

    if (sizeInBytes < mb) {
        return (sizeInBytes / kb).toFixed(1) + " KB";
    }

    if (sizeInBytes < gb) {
        return (sizeInBytes / mb).toFixed(1) + " MB";
    }

    if (sizeInBytes < tb) {
        return (sizeInBytes / gb).toFixed(1) + " GB";
    }

    return "Error: size too big!";
}