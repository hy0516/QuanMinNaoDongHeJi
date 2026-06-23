
interface GameInfo {
    pkg_name: string;
    top_on_app_id: string;
    top_on_app_key: string;
    tj_app_key: string;
    space_ids: null | string[];
    debug_on: number;
  }
  
  interface AdsControl {
    ads_g_switch: number;
    ads_dis_real: number;
    ads_jump_real: number;
    ads_jump_login: number;
    ads_banner: number;
    ads_tl_banner: number;
    ads_interstitial: number;
    ads_osa: number;
    ads_video: number;
    ads_inter_video: number;
    ads_nid: number;
    ads_tl_lc: number;
    ads_nci: number;
    ads_nbi: number;
    ads_icon: number;
    ads_nta: number;
    ads_nso: number;
    ads_customize: number;
    ads_sus_ban: number;
    ads_native_banner: number;
  }
  
  interface NativeBannerConfig {
    take_days: number;
    start_num: number;
    start_time: null | string;
    interval_num: number;
    interval_time: number;
    tbm_rate: number;
    max_tbm_num: number;
    delay_click_start: string;
    close_size: number;
    ads_id: string;
    banner_posX: number;
    banner_posY: number;
    banner_size: number;
    self_ball: number;
    delay_up: number;
    insert_type_arr: string;
  }
  
  interface NciConfig {
    take_days: number;
    start_num: number;
    start_time: number;
    interval_num: number;
    interval_time: number;
    tbm_rate: number;
    max_tbm_num: number;
    delay_click_start: string;
    close_size: number;
    ads_id: string;
    self_ball: number;
    delay_up: number;
    insert_type_arr: string;
  }
  
  interface SimConfig {
    ads_native_banner: NativeBannerConfig;
    ads_nci: NciConfig;
  }
  

  
  // 最外层接口
  export default interface AppConfig {
    adsLst: string;
    game_info: GameInfo;
    contr: AdsControl;
    sim: SimConfig;
  }
