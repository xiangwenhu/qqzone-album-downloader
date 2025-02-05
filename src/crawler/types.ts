export interface ResData<T = any> {
    data: T,
    /**
     * 0表示ok
     */
    code: number;
    message: string;
    subcode?: number;
}



export interface AlbumItem {
    allowAccess: number;
    anonymity: number;
    bitmap: string;
    classid: number;
    comment: number;
    createtime: number;
    desc: Date;
    handset: number;
    id: string;
    lastuploadtime: number;
    modifytime: number;
    name: Date;
    order: number;
    pre: string;
    priv: number;
    pypriv: number;
    total: number;
    viewtype: number;
};


export interface PhotoItem {
    batchId: string;
    browser: number;
    cameratype: string;
    cp_flag: boolean;
    cp_x: number;
    cp_y: number;
    desc?: any;
    forum: number;
    frameno: number;
    height: number;
    id: number;
    is_video: boolean;
    is_weixin_mode: number;
    ismultiup: number;
    lloc: string;
    modifytime: number;
    name: Date;
    origin: number;
    origin_height: number;
    origin_upload: number;
    origin_url: string;
    origin_uuid: string;
    origin_width: number;
    owner: string;
    ownername: string;
    photocubage: number;
    phototype: number;
    picmark_flag: number;
    picrefer: number;
    platformId: number;
    platformSubId: number;
    poiName?: any;
    pre: string;
    raw?: any;
    raw_upload: number;
    rawshoottime: Date;
    shoottime: Date;
    shorturl?: any;
    sloc: string;
    tag?: any;
    uploadtime: Date;
    url: string;
    width: number;
    yurl: number;
};


export interface TravelTimeLineItem {
    begintime: Date;
    endtime: Date;
    isUserConfirmed: number;
    num: number;
    poiId?: any;
    poiX?: any;
    poiY?: any;
    scenceCityName?: any;
    scenceDesc?: any;
    scenceType: number;
    scencename: string;
};

interface TopicItem {
    bitmap: string;
    browser: number;
    classid: number;
    comment: number;
    cover_id: string;
    createtime: number;
    desc: string;
    handset: number;
    id: string;
    is_share_album: number;
    lastuploadtime: number;
    modifytime: number;
    name: string;
    ownerName: string;
    ownerUin: string;
    pre: string;
    priv: number;
    pypriv: number;
    share_album_owner: number;
    total: number;
    url: string;
    viewtype: number;


}

export type Res_CGI_List_Photo = ResData<{
    photoList: PhotoItem[];
    topic: TopicItem;
    travelTimeLine: TravelTimeLineItem[]
}>