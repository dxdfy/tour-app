import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useState, Component } from 'react'
import { AtButton } from 'taro-ui'
import { AtInput, AtForm } from 'taro-ui'

import './register.scss'

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('')
    const handleUsernameInput = (value) => {
        setUsername(value);
    }
    const handlePasswordInput = (value) => {
        setPassword(value);
    }
    // 获取头像onChooseAvatar的方法
    const onChooseAvatar = (e) => {
        setAvatar(e.detail.avatarUrl)
    }


    const handleRegister = () => {
        if (username === '')
            Taro.showToast({
                title: '请输入用户名',
                icon: 'none'
            });
        else if (password === '')
            Taro.showToast({
                title: '请输入密码',
                icon: 'none'
            });
        else {

            const data = {
                username: username,
                password: password,
                // avatar: (avatar !== "" ? avatar : "http://127.0.0.1:3007/public/upload/1711361017494-S5tW9NUlI3bF1a1745f98c2cf7cf09e0b86ce166828e.jpeg")
                avatar: avatar !== "" ? avatar : "http://store/UisovJ1aXm473752af11431ac2292ea4ac4214553a82.jpeg"
            };
            console.log(data)
            // wx.request({
            //     url: 'http://127.0.0.1:3007/api/register',
            //     method: 'POST',
            //     data: data,
            //     header: {
            //         'content-type': 'application/x-www-form-urlencoded'
            //     },
            //     success: function (res) {
            //         console.log('Login successful:', res);
            //     },
            //     fail: function (error) {
            //         console.error('Login failed:', error);
            //     }
            // });
            wx.getFileSystemManager().saveFile({
                tempFilePath: avatar,
                success(res) {
                    const savedFilePath = res.savedFilePath;
                    console.log("保存的头像文件路径：" + savedFilePath);

                    // 上传保存的图片
                    wx.uploadFile({
                        url: 'http://192.168.1.102:3007/api/register',
                        filePath: savedFilePath,
                        name: 'file',
                        formData: {
                            'username': username,
                            'password': password
                        },
                        success(res) {
                            console.log('uploadFile响应数据:', res.data);
                            try {
                                const data = JSON.parse(res.data);
                                console.log(data);
                                console.log('upload success');
                                // console.log("成功获取到用户头像存入数据库:", data.path);
                                console.log("成功获取到用户头像存入数据库:", data.path);
                                // 更新头像URL
                                setAvatar(data.path);

                                // 强制刷新页面
                                // wx.reLaunch({
                                //     url: '/pages/register/register' // 替换成你的页面路径
                                // });

                                wx.showToast({
                                    title: '头像上传成功',
                                    icon: 'success',
                                });
                            } catch (e) {
                                console.log('返回数据不是json格式，无法解析');
                                wx.showToast({
                                    title: '头像上传失败',
                                    icon: 'error'
                                });
                            }
                        },
                        fail(res) {
                            console.log('upload fail');
                        }
                    });
                },
                fail(res) {
                    console.log('saveFile fail');
                }
            });
        }

    }
    return (
        <View className='login'>
            <Button
                open-type="chooseAvatar"
                onChooseAvatar={onChooseAvatar}
            >
                <Image src={avatar} />
            </Button>
            {/* <Input type='number' placeholder='原生刺激' /> */}
            <AtInput
                name='username'
                title='用户名'
                type='text'
                placeholder='请输入用户名'
                value={username}
                onChange={value => handleUsernameInput(value)}
            />
            <AtInput
                name='password'
                title='密码'
                type='password'
                placeholder='请输入密码'
                value={password}
                onChange={value => handlePasswordInput(value)}
            />
            <AtButton type='primary' size='normal' onClick={handleRegister}>注册</AtButton>

        </View>
    )
}