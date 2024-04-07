import { View,  Button, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, {  useEffect, useState } from 'react'
import { AtButton, AtGrid,  AtInput, AtModal, AtModalAction, AtModalContent, AtModalHeader } from 'taro-ui'
import baseUrl from '../baseUrl'
import './my.scss'
export default function My() {
    const [avatar, setAvatar] = useState(wx.getStorageSync('avatar'));
    const [isOpenChangeModal, setIsOpenChangeModal] = useState(false);
    const [isOpenAvatarModal,setIsOpenAvatarModal] = useState(false);
    const [confirmpassword, setConfirmPassword] = useState('')
    const [password, setPassword] = useState('');
    const onChooseAvatar = (e) => {
        setAvatar(e.detail.avatarUrl)
    }
    const handleChangePassword = () => {
        console.log('修改密码');
        setIsOpenChangeModal(true);
    }
    const handleConfirmChange = async () => {
        if (password === '')
            Taro.showToast({
                title: '请输入密码',
                icon: 'none',

            });
        else if (password !== confirmpassword)
            Taro.showToast({
                title: '俩次输入密码不相同',
                icon: 'none'
            });
        else {
            const storedToken = wx.getStorageSync('token');
            const data = {
                username: wx.getStorageSync('username'),
                password: password,
            };
            await wx.request({
                url: `${baseUrl.baseUrl}my/task/update_password`,
                method: 'POST',
                data: data,
                header: {
                    'Authorization': storedToken,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    if (res.data.message === '密码更新成功') {
                        console.log('成功修改密码');
                        setIsOpenChangeModal(true);
                        setPassword('');
                        setConfirmPassword('');
                        wx.removeStorageSync('token');
                        Taro.showToast({
                            title: '修改成功，请重新登陆',
                            icon: 'none',
                            duration: 1000,
                            mask: true,
                        });
                        setTimeout(() => {
                            Taro.reLaunch({
                                url: '/pages/login/login' // 首页的路径
                            });
                            // Taro.navigateTo({ url: '/pages/login/login' });
                        }, 1000);
                    }
                },
                fail: function (error) {
                    console.error('failed:', error);
                    return;
                }
            });
        }
    }
    const handlePasswordInput = (value) => {
        setPassword(value);
    }
    const handleComfirmPasswordInput = (value) => {
        setConfirmPassword(value);
    }
    const handleMessage = ()=>{
        Taro.navigateTo({ url: '/pages/comments/comments' });
    }
    const handleAvatar = ()=>{
        setIsOpenAvatarModal(true);
    }
    const handleGridClick = (item, index) => {
        console.log('点击了宫格:', item, '索引:', index);
        if(index === 2){
            handleChangePassword();
        }else if(index === 1){
            handleAvatar();
        }else if(index === 0){
            handleMessage();
        }else{
            console.log('出错');
        }
    };
    const handleConfirmAvatarUpload= ()=>{
        console.log(avatar);
        if (!avatar.includes('tmp')) {
            Taro.showToast({
                title: '头像还未更改，无需上传',
                icon: 'none',
                duration: 1000,
                mask: true,
                complete: () => {setIsOpenAvatarModal(false)}
            });
            return;
        }
        const data = {
            username: wx.getStorageSync('username'),
        };
        wx.compressImage({
            src: avatar,
            quality: 80,
            success: (res) => {
                const compressedFilePath = res.tempFilePath;
                console.log('compress',compressedFilePath);
                wx.uploadFile({
                    url: `${baseUrl.baseUrl}api/update`,
                    filePath: compressedFilePath, // 文件的临时路径
                    name: `file`, // 后端需要的文件字段名
                    formData: data, // 其他表单数据
                    success(response) {
                        const responseData = JSON.parse(response.data);
                        console.log('成功',responseData.message);
                        if (responseData.message === '头像更新成功') {
                            console.log(responseData.message);
                            const newAvatar = responseData.path;
                            wx.setStorageSync('avatar', newAvatar);
                            Taro.showToast({
                                title: '头像更新成功',
                                icon: 'none',
                                duration: 1000,
                                mask: true,
                                complete: () => {setIsOpenAvatarModal(false)}
                            });
                        }
                        else {
                            console.log(responseData.message);
                        }
                    },
                    fail(error) {
                        console.error('Error:', error);
                    }
                });
            },
            fail: (error) => {
                console.error('Error:', error);
            }
        });
    }
    return (
        <View className='register'>
            <View className='set-avatar' >
                <Button className='avatar-button'
                    open-type="chooseAvatar"
                    onChooseAvatar={onChooseAvatar}
                    // disabled={true}
                >
                    {!avatar && <View className='avatar-text'>点击上传头像</View>}
                    <Image src={avatar} mode='aspectFill' className='avatar-image' />
                </Button>
                <AtGrid mode='rect' data={
                    [
                        {
                            iconInfo: {
                                value: 'message', 
                                size: '20',       
                                color: '#333'     
                            },     
                            value: '我的消息'
                        },{
                            iconInfo: {
                                value: 'image', 
                                size: '20',       
                                color: '#333'     
                            },     
                            value: '修改头像'
                        },{
                            iconInfo: {
                                value: 'user', 
                                size: '20',       
                                color: '#333'     
                            },     
                            value: '修改密码',
                            onClick: () => handleChangePassword(),
                        },
                    ]
                   }  onClick={(item, index) => handleGridClick(item, index)}
                   />
                {/* <AtButton type='secondary' onClick={handleChangePassword}>修改密码</AtButton> */}
            </View>
            <AtModal isOpened={isOpenChangeModal} closeOnClickOverlay={false}>
                <AtModalHeader>修改密码</AtModalHeader>
                <AtModalContent>
                    <View>
                        <AtInput
                            name='password'
                            title='密码'
                            type='password'
                            placeholder='请输入密码'
                            value={password}
                            onChange={value => handlePasswordInput(value)}
                        />
                    </View>
                    <View>
                        <AtInput
                            name='comfirmpassword'
                            title='密码'
                            type='password'
                            placeholder='确认密码'
                            value={confirmpassword}
                            onChange={value => handleComfirmPasswordInput(value)}
                        />
                    </View>
                </AtModalContent>
                <AtModalAction>
                    <AtButton onClick={() => { setIsOpenChangeModal(false) }}>取消</AtButton>
                    <AtButton onClick={handleConfirmChange}>确认</AtButton>
                </AtModalAction>
            </AtModal>
            <AtModal isOpened={isOpenAvatarModal} closeOnClickOverlay={false}>
                    <AtModalHeader>确认头像上传</AtModalHeader>
                    <AtModalContent>
                        是否确认上传新的头像？
                    </AtModalContent>
                    <AtModalAction>
                        <AtButton onClick={() => {setIsOpenAvatarModal(false)}}>取消</AtButton>
                        <AtButton onClick={handleConfirmAvatarUpload}>确认</AtButton>
                    </AtModalAction>
                </AtModal>
        </View>
    );
}