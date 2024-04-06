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
    const [confirmpassword, setConfirmPassword] = useState('')
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
    const handleComfirmPasswordInput = (value) => {
        setConfirmPassword(value);
    }
    const myUpload = (data) => {
        wx.getFileSystemManager().saveFile({
            tempFilePath: data.avatar,
            success(res) {
                const savedFilePath = res.savedFilePath;
                console.log("保存的头像文件路径：" + savedFilePath);

                // 上传保存的图片
                wx.uploadFile({
                    url: 'http://192.168.1.105:3007/api/register',
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
                            console.log(data.status);
                            if (data.status === 0) {
                                console.log('upload success');
                                // console.log("成功获取到用户头像存入数据库:", data.path);
                                console.log("成功获取到用户头像存入数据库:", data.path);
                                // 更新头像URL
                                // setAvatar(data.path);

                                // 强制刷新页面
                                // wx.reLaunch({
                                //     url: '/pages/register/register' // 替换成你的页面路径
                                // });

                                wx.showToast({
                                    title: '注册成功',
                                    icon: 'success',
                                });
                                setTimeout(function () {
                                    Taro.navigateTo({ url: '/pages/login/login' });
                                }, 300);
                                // Taro.navigateTo({ url: '/pages/login/login' })
                            }
                            else {
                                if (data.message === "用户名被占用，请更换其它用户名！") {
                                    wx.showToast({
                                        title: '用户名被占用',
                                        icon: 'error',
                                    });
                                }
                            }

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
        else if (password !== confirmpassword)
            Taro.showToast({
                title: '俩次输入密码不相同',
                icon: 'none'
            });
        else {
            let tmpavatar = "";
            if (avatar === "") {
                wx.downloadFile({
                    url: 'http://192.168.1.108:3007/public/upload/1712151146766-w3L2FF4Mtnu3a41f5de0b945ef5fe1cb3c1b72ff383f.jpeg',
                    success: function (res) {
                        if (res.statusCode === 200) {
                            const data = {
                                username: username,
                                password: password,
                                // avatar: (avatar !== "" ? avatar : "http://192.168.1.105:3007/public/upload/1711361017494-S5tW9NUlI3bF1a1745f98c2cf7cf09e0b86ce166828e.jpeg")
                                avatar: res.tempFilePath,
                            };
                            console.log(data)
                            myUpload(data)
                        } else {
                            console.log('下载失败', res)
                        }
                    },
                    fail: function (error) {
                        console.log('下载失败', error)
                    }
                })
            }
            else {
                const data = {
                    username: username,
                    password: password,
                    // avatar: (avatar !== "" ? avatar : "http://192.168.1.105:3007/public/upload/1711361017494-S5tW9NUlI3bF1a1745f98c2cf7cf09e0b86ce166828e.jpeg")
                    avatar: avatar,
                };
                console.log(data)
                myUpload(data)

            }
        }

    }
    return (
        <View className='register'>
            <View className='set-avatar' >
                <Button className='avatar-button'
                    open-type="chooseAvatar"
                    onChooseAvatar={onChooseAvatar}
                >
                    {!avatar && <View className='avatar-text'>点击上传头像</View>}

                    <Image src={avatar} mode='aspectFill' className='avatar-image' />
                </Button>
            </View>
            {/* <Input type='number' placeholder='原生刺激' /> */}
            <View className='username'>
                {/* <Text>用户名:</Text> */}
                <AtInput
                    name='username'
                    title='用户名'
                    type='text'
                    placeholder='请输入用户名'
                    value={username}
                    onChange={value => handleUsernameInput(value)}
                />
            </View>
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
            <View>
                <AtButton type='primary' size='normal' onClick={handleRegister}>注册</AtButton>
            </View>


        </View>
    )
}