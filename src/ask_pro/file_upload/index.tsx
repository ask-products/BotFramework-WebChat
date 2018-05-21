
import axios from 'axios';
const ax = axios.create({ baseURL: '', timeout: 30000, headers: '' });

const getSignedUrl = async (file: any) => {
    const authResult = JSON.parse(localStorage.getItem('auth_result'));
    let info: any;
    if( authResult ) {
        const profile = authResult.idTokenPayload;
        const key = 'https://api-re-porter.co/_app_metadata';
        info = profile[key];
    } else {
        info = {domain:'acme', identifier:'00000000'}
    }
    const ident = info.identifier.slice(1);

    return ax.request({
        url:        'https://j0gzx3un1j.execute-api.eu-west-1.amazonaws.com/dev/gen',
        method:     'GET',
        params:     {
                        fileType: file.type,
                        fileName: info.domain+'/'+ident+'/'+file.name
                    }
    })
    .then((r) => {
        return ({
            status:     r.status,
            data :      r.data,
            fileName:   info.domain+'/'+ident+'/'+file.name
        });
    });
}
const putFile = async (response: any, file: any) => {
    return ax.request({
        url:        response.data.url,
        method:     'PUT',
        headers:    { 'content-type': file.type },
        data:       file
    })
    .then((r) => {
        return ({
            contentUrl:     'https://s3-eu-west-1.amazonaws.com/re-porter-customer-files/' + response.fileName,
            contentType:    file.type,
            name:           file.name
        });
    });
}
const apUriFromFiles = (files: any) =>{
    let calls: any = [];
    for(let userFile of files) {

        calls.push( getSignedUrl(userFile)
                    .then((r: any) => {
                        if( r.status === 200 ){
                            return(putFile(r,userFile));
                        } else {
                            console.log('error', r.status);
                        }
                    })
        )
    }
    return calls;
}

export { apUriFromFiles }
